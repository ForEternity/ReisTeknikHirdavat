using MediatR;
using Microsoft.AspNetCore.Mvc;
using ReisTeknikHirdavat.Application.Features.Orders.Commands.CreateOrder;

namespace ReisTeknikHirdavat.WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class OrdersController : ControllerBase
{
    private readonly IMediator _mediator;

    public OrdersController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPost]
    public async Task<IActionResult> CreateOrder([FromBody] CreateOrderCommand command)
    {
        try
        {
            // Kullanıcının IP adresini context üzerinden güvenli alıp command'e enjekte ediyoruz
            var clientIp = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "127.0.0.1";
            var updatedCommand = command with { UserIpAddress = clientIp };

            var orderId = await _mediator.Send(updatedCommand);
            return Ok(new { Success = true, OrderId = orderId, Message = "Siparişiniz yasal onaylarla birlikte başarıyla oluşturuldu." });
        }
        catch (Exception ex)
        {
            return BadRequest(new { Success = false, Message = ex.Message });
        }
    }
}