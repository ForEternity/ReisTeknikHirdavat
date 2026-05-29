using ReisTeknikHirdavat.Domain.Common;

namespace ReisTeknikHirdavat.Domain.Entities;

public class OrderItem : BaseEntity
{
    public Guid OrderId { get; set; }
    public Guid ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string Sku { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal Price { get; set; } // Sipariş anındaki fiyat sabitlemesi
}