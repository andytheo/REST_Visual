using System.Collections.Concurrent;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddSingleton<ProductRepository>();

var app = builder.Build();

app.UseDefaultFiles();
app.UseStaticFiles();

app.MapGet("/api/products", (ProductRepository repo) =>
{
    return Results.Ok(repo.GetAll());
});

app.MapGet("/api/products/{id:int}", (int id, ProductRepository repo) =>
{
    var product = repo.GetById(id);
    return product is null ? Results.NotFound(new { message = $"Product {id} was not found." }) : Results.Ok(product);
});

app.MapPost("/api/products", (CreateProductRequest request, ProductRepository repo, HttpContext http) =>
{
    if (string.IsNullOrWhiteSpace(request.Name) || request.Price <= 0)
    {
        return Results.BadRequest(new { message = "Name is required and price must be greater than 0." });
    }

    var created = repo.Create(request);
    var location = $"/api/products/{created.Id}";
    http.Response.Headers.Location = location;
    return Results.Json(created, statusCode: StatusCodes.Status201Created);
});

app.MapDelete("/api/products/{id:int}", (int id, ProductRepository repo) =>
{
    return repo.Delete(id) ? Results.NoContent() : Results.NotFound(new { message = $"Product {id} was not found." });
});

app.MapFallbackToFile("index.html");

app.Run();

record Product(int Id, string Name, decimal Price, string Description, string ImageUrl, string Photographer, string PhotographerUrl, string PhotoUrl, string Category);
record CreateProductRequest(string Name, decimal Price, string? Description, string? ImageUrl, string? Photographer, string? PhotographerUrl, string? PhotoUrl, string? Category);

sealed class ProductRepository
{
    private readonly ConcurrentDictionary<int, Product> _products = new(new[]
    {
        new KeyValuePair<int, Product>(42, new Product(
            42,
            "Arc 75 Mechanical Keyboard",
            99.99m,
            "A compact mechanical keyboard with tactile switches, a solid aluminum frame, and a clean desk-friendly layout.",
            "https://images.unsplash.com/photo-1654618871718-9db01bf9f507?auto=format&fit=crop&w=1200&q=85",
            "Eakchhung Lim",
            "https://unsplash.com/@eakchhung?utm_source=gadget_depo&utm_medium=referral",
            "https://unsplash.com/photos/a-computer-keyboard-sitting-on-top-of-a-desk-jAz0YVMgNfA?utm_source=gadget_depo&utm_medium=referral",
            "Keyboards")),
        new KeyValuePair<int, Product>(43, new Product(
            43,
            "Flux Wireless Mouse",
            59.99m,
            "A lightweight wireless mouse designed for everyday productivity and a clean minimalist setup.",
            "https://images.unsplash.com/photo-1670594454664-42fa9837060c?auto=format&fit=crop&w=1200&q=85",
            "Unsplash contributor",
            "https://unsplash.com/?utm_source=gadget_depo&utm_medium=referral",
            "https://unsplash.com/photos/uiFYQP1iQlA?utm_source=gadget_depo&utm_medium=referral",
            "Mice")),
        new KeyValuePair<int, Product>(44, new Product(
            44,
            "Studio Wireless Headphones",
            149.99m,
            "Comfortable over-ear headphones with a simple design for focused work, calls, and music.",
            "https://images.unsplash.com/photo-1540821924489-7690c70c4eac?auto=format&fit=crop&w=1200&q=85",
            "Unsplash contributor",
            "https://unsplash.com/?utm_source=gadget_depo&utm_medium=referral",
            "https://unsplash.com/s/photos/sony-headphone?utm_source=gadget_depo&utm_medium=referral",
            "Audio"))
    });

    private int _nextId = 44;

    public IReadOnlyCollection<Product> GetAll() => _products.Values.OrderBy(p => p.Id).ToArray();

    public Product? GetById(int id) => _products.TryGetValue(id, out var product) ? product : null;

    public Product Create(CreateProductRequest request)
    {
        var id = Interlocked.Increment(ref _nextId);
        var product = new Product(
            id,
            request.Name.Trim(),
            request.Price,
            string.IsNullOrWhiteSpace(request.Description) ? "A new Gadget Depo product." : request.Description.Trim(),
            string.IsNullOrWhiteSpace(request.ImageUrl) ? "https://images.unsplash.com/photo-1654618871718-9db01bf9f507?auto=format&fit=crop&w=1200&q=85" : request.ImageUrl,
            string.IsNullOrWhiteSpace(request.Photographer) ? "Unsplash contributor" : request.Photographer,
            string.IsNullOrWhiteSpace(request.PhotographerUrl) ? "https://unsplash.com/?utm_source=gadget_depo&utm_medium=referral" : request.PhotographerUrl,
            string.IsNullOrWhiteSpace(request.PhotoUrl) ? "https://unsplash.com/?utm_source=gadget_depo&utm_medium=referral" : request.PhotoUrl,
            string.IsNullOrWhiteSpace(request.Category) ? "Accessories" : request.Category.Trim());

        _products[id] = product;
        return product;
    }

    public bool Delete(int id) => _products.TryRemove(id, out _);
}
