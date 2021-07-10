using System;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Hosting;

namespace AmoLeadManagementApi {
  public class Program {
    private static string Port => Environment.GetEnvironmentVariable("AMO_PORT") ?? "3000";
    public static void Main(string[] args) {
      CreateHostBuilder(args).Build().Run();
    }

    private static IHostBuilder CreateHostBuilder(string[] args) =>
      Host.CreateDefaultBuilder(args)
        .ConfigureWebHostDefaults(ConfigureBuilder);

    private static void ConfigureBuilder(IWebHostBuilder builder) => builder
      .UseStartup<Startup>()
      .UseUrls($"http://*:{Port}");
  }
}
