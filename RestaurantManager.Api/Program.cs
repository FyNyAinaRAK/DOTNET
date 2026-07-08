using Microsoft.EntityFrameworkCore;
using RestaurantManager.Infrastructure.Data;
using RestaurantManager.Core.Entities;
using RestaurantManager.Core.Enums;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.SignalR;
using RestaurantManager.Api.Hubs;
var builder = WebApplication.CreateBuilder(args);

// Fix circular references in JSON serialization (Product <-> Category)
builder.Services.ConfigureHttpJsonOptions(options =>
{
    options.SerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
});

// Add services to the container.
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddSignalR();

// Configure CORS for frontend
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials(); // Required for SignalR
    });
});

// Configure Database
builder.Services.AddDbContext<RestaurantDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("AllowFrontend");

// Endpoints
app.MapGet("/api/products", async (RestaurantDbContext db) =>
{
    return await db.Products.Include(p => p.Category).ToListAsync();
})
.WithName("GetProducts")
.WithOpenApi();

app.MapPost("/api/products", async (Product product, RestaurantDbContext db) =>
{
    db.Products.Add(product);
    await db.SaveChangesAsync();
    return Results.Created($"/api/products/{product.Id}", product);
});

app.MapDelete("/api/products/{id}", async (int id, RestaurantDbContext db) =>
{
    var product = await db.Products.FindAsync(id);
    if (product is null) return Results.NotFound();
    db.Products.Remove(product);
    await db.SaveChangesAsync();
    return Results.NoContent();
});

app.MapGet("/api/categories", async (RestaurantDbContext db) =>
{
    return await db.Categories.ToListAsync();
})
.WithName("GetCategories")
.WithOpenApi();

app.MapGet("/api/orders", async (RestaurantDbContext db) =>
{
    return await db.Orders.Include(o => o.Items).ThenInclude(i => i.Product).OrderByDescending(o => o.OrderDate).ToListAsync();
});

app.MapPost("/api/orders", async (Order order, RestaurantDbContext db, IHubContext<OrderHub> hubContext) =>
{
    db.Orders.Add(order);
    await db.SaveChangesAsync();
    // Include items for broadcasting
    var fullOrder = await db.Orders.Include(o => o.Items).ThenInclude(i => i.Product).FirstOrDefaultAsync(o => o.Id == order.Id);
    await hubContext.Clients.All.SendAsync("OrderCreated", fullOrder);
    return Results.Created($"/api/orders/{order.Id}", fullOrder);
})
.WithName("CreateOrder")
.WithOpenApi();

app.MapPut("/api/orders/{id}/status", async (int id, OrderStatus status, RestaurantDbContext db, IHubContext<OrderHub> hubContext) =>
{
    var order = await db.Orders.FindAsync(id);
    if (order is null) return Results.NotFound();
    order.Status = status;
    await db.SaveChangesAsync();
    await hubContext.Clients.All.SendAsync("OrderStatusChanged", id, status, order.TableNumber);
    return Results.NoContent();
});

app.MapPut("/api/orders/{id}/pay", async (int id, RestaurantDbContext db, IHubContext<OrderHub> hubContext) =>
{
    var order = await db.Orders.FindAsync(id);
    if (order is null) return Results.NotFound();
    order.PaymentStatus = PaymentStatus.Paid;
    await db.SaveChangesAsync();
    await hubContext.Clients.All.SendAsync("OrderPaid", id, order.TableNumber);
    return Results.NoContent();
});

app.MapGet("/api/stats", async (RestaurantDbContext db) =>
{
    var today = DateTime.UtcNow.Date;
    var todayOrders = await db.Orders.Where(o => o.OrderDate >= today).ToListAsync();
    var totalSales = todayOrders.Where(o => o.PaymentStatus == PaymentStatus.Paid).Sum(o => o.TotalAmount);
    var orderCount = todayOrders.Count;
    return Results.Ok(new { TotalSales = totalSales, OrderCount = orderCount, Orders = todayOrders });
});

app.MapHub<OrderHub>("/orderhub");

// Auto-migrate on startup
using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<RestaurantDbContext>();
    dbContext.Database.EnsureCreated();
}

app.Run();
