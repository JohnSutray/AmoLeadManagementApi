using Microsoft.AspNetCore.Mvc;

namespace AmoLeadManagementApi.Controllers {
  [ApiController]
  public class HomeController: Controller {
    [HttpGet("")]
    public string Home() => "amo-lead-management-api";
  }
}