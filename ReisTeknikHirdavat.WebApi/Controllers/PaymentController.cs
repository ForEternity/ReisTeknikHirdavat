using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ReisTeknikHirdavat.Application.Interfaces;
using ReisTeknikHirdavat.Domain.Enums;

namespace ReisTeknikHirdavat.WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PaymentController : ControllerBase
{
    private readonly IPaymentService _paymentService;
    private readonly IApplicationDbContext _context;

    public PaymentController(IPaymentService paymentService, IApplicationDbContext context)
    {
        _paymentService = paymentService;
        _context = context;
    }

    [HttpPost("callback")]
    [Consumes("application/x-www-form-urlencoded")]
    public async Task<IActionResult> PayTrCallback([FromForm] IFormCollection form)
    {
        var paramsDict = form.ToDictionary(x => x.Key, x => x.Value.ToString());

        // Gelen isteğin gerçekten PayTR'dan gelip gelmediğini doğrula (Güvenlik Duvarı)
        if (!_paymentService.ValidateCallbackRequest(paramsDict, "TEST_MERCHANT_KEY", "TEST_MERCHANT_SALT"))
        {
            return BadRequest("Geçersiz hash imzası.");
        }

        var orderNumber = paramsDict["merchant_oid"];
        var order = await _context.Orders.FirstOrDefaultAsync(x => x.OrderNumber == orderNumber);

        if (order == null) return NotFound("Sipariş bulunamadı.");

        if (paramsDict["status"] == "success")
        {
            // Ödeme başarılı -> Siparişi onayla ve hazırlık aşamasına geçir
            order.Status = OrderStatus.Preparing;
            order.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync(CancellationToken.None);

            // PayTR sistemine "OK" yanıtı dönmek zorunludur, aksi halde sürekli tekrar istek atar.
            return Ok("OK");
        }
        else
        {
            // Ödeme başarısız -> Siparişi iptal et ve stoğu geri yükle
            order.Status = OrderStatus.Cancelled;
            order.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync(CancellationToken.None);

            return Ok("OK");
        }
    }
}