using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Hosting;

namespace AmoLeadManagementApi {
  public class Program {
    public static void Main(string[] args) {
      CreateHostBuilder(args).Build().Run();
    }

    private static IHostBuilder CreateHostBuilder(string[] args) =>
      Host.CreateDefaultBuilder(args)
        .ConfigureWebHostDefaults(ConfigureBuilder);
    
    private static void ConfigureBuilder(IWebHostBuilder builder) => builder
      .UseUrls("https://localhost:3000")
      .UseStartup<Startup>();
  }
}