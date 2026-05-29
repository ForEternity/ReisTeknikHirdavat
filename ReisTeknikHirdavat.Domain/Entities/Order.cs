using ReisTeknikHirdavat.Domain.Common;
using ReisTeknikHirdavat.Domain.Enums;

namespace ReisTeknikHirdavat.Domain.Entities;

public class Order : BaseEntity
{
    public string OrderNumber { get; set; } = string.Empty; // Örn: RTH202600001
    public Guid CustomerId { get; set; }

    // Teslimat ve Fatura Bilgileri
    public string CustomerName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public string ShippingAddress { get; set; } = string.Empty;
    public string BillingAddress { get; set; } = string.Empty;

    // Kurumsal Fatura Bilgileri (Hırdatvatçılarda çok yaygındır)
    public string? TaxOffice { get; set; }
    public string? TaxNumber { get; set; }
    public string? CompanyName { get; set; }

    // Mali Durum
    public decimal TotalAmount { get; set; }
    public OrderStatus Status { get; set; } = OrderStatus.New;
    public OrderSource Source { get; set; } = OrderSource.Web;

    // KVKK ve Yasal Loglar (İleride yasal incelemede kanıt oluşturması için)
    public string UserIpAddress { get; set; } = string.Empty;
    public bool KvkkApproved { get; set; }
    public bool MssApproved { get; set; } // Mesafeli Satış Sözleşmesi Onayı

    // İlişkiler
    public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
}