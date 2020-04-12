using System.Threading.Tasks;
using AmoLeadManagementApi.Models;
using AmoLeadManagementApi.Services;
using Microsoft.AspNetCore.Mvc;

namespace AmoLeadManagementApi.Controllers {
  [Route("lead")]
  [ApiController]
  public class LeadController : Controller {
    private LeadService LeadService { get; }

    public LeadController(LeadService leadService) => LeadService = leadService;

    [HttpPost]
    public async Task<ActionResult> CreateLead(CreateLeadDto dto) {
      await LeadService.CreateLead(dto);

      return Ok();
    }
  }
}