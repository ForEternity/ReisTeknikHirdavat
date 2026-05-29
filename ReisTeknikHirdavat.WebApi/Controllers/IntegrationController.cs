using MediatR;
using Microsoft.AspNetCore.Mvc;
using ReisTeknikHirdavat.Application.Features.Products.Commands.SyncTrendyolProducts;

namespace ReisTeknikHirdavat.WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class IntegrationController : ControllerBase
{
    private readonly IMediator _mediator;

    public IntegrationController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPost("sync-trendyol")]
    public async Task<IActionResult> SyncTrendyol([FromBody] SyncTrendyolProductsCommand command)
    {
        try
        {
            var addedCount = await _mediator.Send(command);
            return Ok(new { Success = true, Message = $"{addedCount} adet yeni ürün başarıyla aktarıldı, mevcut ürünler güncellendi." });
        }
        catch (Exception ex)
        {
            return BadRequest(new { Success = false, Message = ex.Message });
        }
    }
}