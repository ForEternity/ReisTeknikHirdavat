using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ReisTeknikHirdavat.Domain.Entities;

namespace ReisTeknikHirdavat.Persistence.Configurations;

public class OrderConfiguration : IEntityTypeConfiguration<Order>
{
    public void Configure(EntityTypeBuilder<Order> builder)
    {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.OrderNumber).HasMaxLength(50).IsRequired();
        builder.Property(x => x.CustomerName).HasMaxLength(150).IsRequired();
        builder.Property(x => x.PhoneNumber).HasMaxLength(20).IsRequired();
        builder.Property(x => x.TotalAmount).HasPrecision(18, 2);

        builder.HasIndex(x => x.OrderNumber).IsUnique();
        builder.HasQueryFilter(x => !x.IsDeleted);

        builder.HasMany(x => x.OrderItems)
               .WithOne()
               .HasForeignKey(x => x.OrderId)
               .OnDelete(DeleteBehavior.Cascade);
    }
}