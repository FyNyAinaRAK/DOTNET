using Microsoft.EntityFrameworkCore;
using RestaurantManager.Core.Entities;

namespace RestaurantManager.Infrastructure.Data;

public class RestaurantDbContext : DbContext
{
    public RestaurantDbContext(DbContextOptions<RestaurantDbContext> options) : base(options)
    {
    }

    public DbSet<Product> Products { get; set; }
    public DbSet<Category> Categories { get; set; }
    public DbSet<Order> Orders { get; set; }
    public DbSet<OrderItem> OrderItems { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configuration fluent API
        modelBuilder.Entity<Product>()
            .Property(p => p.Price)
            .HasColumnType("decimal(18,2)");
            
        modelBuilder.Entity<Order>()
            .Property(o => o.TotalAmount)
            .HasColumnType("decimal(18,2)");
            
        modelBuilder.Entity<OrderItem>()
            .Property(oi => oi.UnitPrice)
            .HasColumnType("decimal(18,2)");
            
        // Initial data seeding — Menu complet
        modelBuilder.Entity<Category>().HasData(
            new Category { Id = 1, Name = "Burgers", Icon = "🍔" },
            new Category { Id = 2, Name = "Pizzas", Icon = "🍕" },
            new Category { Id = 3, Name = "Poulets", Icon = "🍗" },
            new Category { Id = 4, Name = "Steaks", Icon = "🥩" },
            new Category { Id = 5, Name = "Spaghettis", Icon = "🍝" },
            new Category { Id = 6, Name = "Entrées & Salades", Icon = "🥗" },
            new Category { Id = 7, Name = "Boissons", Icon = "🥤" },
            new Category { Id = 8, Name = "Desserts & Glaces", Icon = "🍨" },
            new Category { Id = 9, Name = "Fritures", Icon = "🍟" },
            new Category { Id = 10, Name = "Grillades", Icon = "🔥" }
        );
        
        modelBuilder.Entity<Product>().HasData(
            // === BURGERS ===
            new Product { Id = 1,  Name = "Big Burger Frites + Jus",  Description = "Burger complet avec frites et boisson",    Price = 17000m, CategoryId = 1, ImageUrl = "" },
            new Product { Id = 2,  Name = "Hamburger Classic",        Description = "Pain, steak haché, salade, tomate",         Price = 9000m,  CategoryId = 1, ImageUrl = "" },
            new Product { Id = 3,  Name = "Croque-Monsieur",          Description = "Jambon, fromage gratiné",                   Price = 9000m,  CategoryId = 1, ImageUrl = "" },
            new Product { Id = 4,  Name = "Cheeseburger Deluxe",      Description = "Double fromage, bacon, sauce spéciale",     Price = 14000m, CategoryId = 1, ImageUrl = "" },

            // === PIZZAS ===
            new Product { Id = 5,  Name = "Pizza Fruit de Mer",       Description = "Crevette, thon, calmar, poisson, olive",    Price = 26000m, CategoryId = 2, ImageUrl = "" },
            new Product { Id = 6,  Name = "Pizza Quatre Saisons",     Description = "Poulet, champignon, charcuterie, maïs",     Price = 26000m, CategoryId = 2, ImageUrl = "" },
            new Product { Id = 7,  Name = "Pizza 4 Fromages",         Description = "Mozzarella, emmental, chèvre, parmesan",    Price = 23000m, CategoryId = 2, ImageUrl = "" },
            new Product { Id = 8,  Name = "Pizza Bolognaise",         Description = "Origan, viande hachée, olives, fromage",    Price = 23000m, CategoryId = 2, ImageUrl = "" },
            new Product { Id = 9,  Name = "Pizza Margherita",         Description = "Fromage, olives, origan",                   Price = 22000m, CategoryId = 2, ImageUrl = "" },

            // === POULETS ===
            new Product { Id = 10, Name = "Poulet Sauce Curry",       Description = "Poulet mijoté sauce curry maison",          Price = 13500m, CategoryId = 3, ImageUrl = "" },
            new Product { Id = 11, Name = "Poulet Frit",              Description = "Morceaux de poulet croustillants",          Price = 6000m,  CategoryId = 3, ImageUrl = "" },
            new Product { Id = 12, Name = "Poulet Pané",              Description = "Poulet pané doré et croustillant",          Price = 15000m, CategoryId = 3, ImageUrl = "" },
            new Product { Id = 13, Name = "Poulet Croustillant",      Description = "Poulet extra croustillant épicé",           Price = 16000m, CategoryId = 3, ImageUrl = "" },
            new Product { Id = 14, Name = "Croquette de Poulet",      Description = "Croquettes dorées (6 pièces)",             Price = 18000m, CategoryId = 3, ImageUrl = "" },

            // === STEAKS ===
            new Product { Id = 15, Name = "Filet de Zébu sauté",      Description = "Filet de zébu sauté aux légumes",          Price = 14500m, CategoryId = 4, ImageUrl = "" },
            new Product { Id = 16, Name = "Steak Haché",              Description = "Steak haché grillé, accompagnement",       Price = 13500m, CategoryId = 4, ImageUrl = "" },
            new Product { Id = 17, Name = "Steak au Poivre Vert",     Description = "Steak sauce poivre vert",                  Price = 16500m, CategoryId = 4, ImageUrl = "" },
            new Product { Id = 18, Name = "Steak Pané",               Description = "Steak pané croustillant",                  Price = 16500m, CategoryId = 4, ImageUrl = "" },
            new Product { Id = 19, Name = "Steak Cordon Bleu",        Description = "Cordon bleu farci fromage et jambon",      Price = 17500m, CategoryId = 4, ImageUrl = "" },

            // === SPAGHETTIS ===
            new Product { Id = 20, Name = "Spaghetti aux Fromages",   Description = "Pâtes au fromage fondu",                   Price = 9000m,  CategoryId = 5, ImageUrl = "" },
            new Product { Id = 21, Name = "Spaghetti Milanaise",      Description = "Sauce tomate, viande hachée",              Price = 11000m, CategoryId = 5, ImageUrl = "" },
            new Product { Id = 22, Name = "Spaghetti Bolognaise",     Description = "Sauce bolognaise maison",                  Price = 13000m, CategoryId = 5, ImageUrl = "" },
            new Product { Id = 23, Name = "Spaghetti Carbonara",      Description = "Crème, lardons, parmesan",                 Price = 13000m, CategoryId = 5, ImageUrl = "" },

            // === ENTRÉES & SALADES ===
            new Product { Id = 24, Name = "Salade Verte",             Description = "Salade fraîche de saison",                  Price = 3000m,  CategoryId = 6, ImageUrl = "" },
            new Product { Id = 25, Name = "Salade de Tomate",         Description = "Tomates fraîches, oignons, vinaigrette",    Price = 3500m,  CategoryId = 6, ImageUrl = "" },
            new Product { Id = 26, Name = "Salade Charcuterie",       Description = "Salade composée avec charcuterie",          Price = 9000m,  CategoryId = 6, ImageUrl = "" },
            new Product { Id = 27, Name = "Salade Gourmande",         Description = "Salade complète, poulet, fromage, œuf",     Price = 12000m, CategoryId = 6, ImageUrl = "" },

            // === BOISSONS ===
            new Product { Id = 28, Name = "Café Noir",                Description = "Café noir corsé",                           Price = 2000m,  CategoryId = 7, ImageUrl = "" },
            new Product { Id = 29, Name = "Café au Lait",             Description = "Café crémeux au lait",                      Price = 3500m,  CategoryId = 7, ImageUrl = "" },
            new Product { Id = 30, Name = "Thé Nature",               Description = "Thé classique",                             Price = 2000m,  CategoryId = 7, ImageUrl = "" },
            new Product { Id = 31, Name = "Chocolat Chaud",           Description = "Chocolat chaud onctueux",                   Price = 3600m,  CategoryId = 7, ImageUrl = "" },
            new Product { Id = 32, Name = "Milkshake Simple",         Description = "Milkshake vanille ou chocolat",             Price = 5000m,  CategoryId = 7, ImageUrl = "" },
            new Product { Id = 33, Name = "Jus de Fruits Frais",      Description = "Jus pressé du jour",                        Price = 4000m,  CategoryId = 7, ImageUrl = "" },

            // === DESSERTS & GLACES ===
            new Product { Id = 34, Name = "Salade de Fruits",         Description = "Fruits frais mixés de saison",              Price = 4000m,  CategoryId = 8, ImageUrl = "" },
            new Product { Id = 35, Name = "Banane Flambée",           Description = "Banane flambée au rhum",                    Price = 6000m,  CategoryId = 8, ImageUrl = "" },
            new Product { Id = 36, Name = "Crêpe Nature",             Description = "Crêpe fine et dorée",                       Price = 4000m,  CategoryId = 8, ImageUrl = "" },
            new Product { Id = 37, Name = "Crêpe au Chocolat",        Description = "Crêpe nappée de chocolat fondant",          Price = 6000m,  CategoryId = 8, ImageUrl = "" },
            new Product { Id = 38, Name = "Glace 2 Boules Chantilly", Description = "2 boules au choix + chantilly",             Price = 7000m,  CategoryId = 8, ImageUrl = "" },

            // === FRITURES ===
            new Product { Id = 39, Name = "Pommes Frites",            Description = "Frites dorées et croustillantes",           Price = 3000m,  CategoryId = 9, ImageUrl = "" },
            new Product { Id = 40, Name = "Frites aux Fromages",      Description = "Frites gratinées au fromage fondu",         Price = 6000m,  CategoryId = 9, ImageUrl = "" },
            new Product { Id = 41, Name = "NEM 3 pièces",             Description = "Nems croustillants faits maison",           Price = 13000m, CategoryId = 9, ImageUrl = "" },
            new Product { Id = 42, Name = "Beignet de Crevettes",     Description = "Beignets de crevettes panées",             Price = 12000m, CategoryId = 9, ImageUrl = "" },

            // === GRILLADES ===
            new Product { Id = 43, Name = "Brochette de Zébu",        Description = "Brochettes de zébu grillées",              Price = 7000m,  CategoryId = 10, ImageUrl = "" },
            new Product { Id = 44, Name = "Poulet Grillé",            Description = "Poulet entier grillé aux épices",           Price = 25000m, CategoryId = 10, ImageUrl = "" },
            new Product { Id = 45, Name = "Côte de Porc Grillée",     Description = "Côte de porc grillée, sauce moutarde",     Price = 16500m, CategoryId = 10, ImageUrl = "" }
        );
    }
}
