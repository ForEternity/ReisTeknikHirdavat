using Microsoft.EntityFrameworkCore;
using ReisTeknikHirdavat.Domain.Entities;

namespace ReisTeknikHirdavat.Application.Interfaces;

public interface IApplicationDbContext
{
    DbSet<Product> Products { get; }
    DbSet<ProductImage> ProductImages { get; }
    DbSet<Order> Orders { get; }
    DbSet<OrderItem> OrderItems { get; }
    Task<int> SaveChangesAsync(CancellationToken cancellationToken);
}