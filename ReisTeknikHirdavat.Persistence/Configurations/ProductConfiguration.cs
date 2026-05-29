using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ReisTeknikHirdavat.Domain.Entities;

namespace ReisTeknikHirdavat.Persistence.Configurations;

public class ProductConfiguration : IEntityTypeConfiguration<Product>
{
    public void Configure(EntityTypeBuilder<Product> builder)
    {
        builder.HasKey(x => x.Id);

        builder.Property(x => x.Name).HasMaxLength(250).IsRequired();
        builder.Property(x => x.Sku).HasMaxLength(100).IsRequired();
        builder.Property(x => x.Barcode).HasMaxLength(100).IsRequired();

        builder.Property(x => x.Price).HasPrecision(18, 2);
        builder.Property(x => x.DiscountPrice).HasPrecision(18, 2);

        builder.HasIndex(x => x.Sku).IsUnique();
        builder.HasIndex(x => x.Barcode).IsUnique();

        // Soft delete filtresi - Global Query Filter
        builder.HasQueryFilter(x => !x.IsDeleted);

        builder.HasMany(x => x.Images)
               .WithOne()
               .HasForeignKey(x => x.ProductId)
               .OnDelete(DeleteBehavior.Cascade);
    }
}