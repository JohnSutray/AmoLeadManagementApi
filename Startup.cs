using AmoLeadManagementApi.Extensions.ServiceCollection;
using AmoLeadManagementApi.Factories;
using AmoLeadManagementApi.Services;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

namespace AmoLeadManagementApi {
  public class Startup {
    public void ConfigureServices(IServiceCollection services) => services
      .AddControllers()
      .AddNewtonJsonServices()
      .AddCors()
      .AddTransient<LeadService>()
      .AddTransient<AmoService>()
      .AddSingleton(AmoAuthFactory.Create)
      .AddSingleton(TelegramBotFactory.Create);

    public void Configure(IApplicationBuilder app, IWebHostEnvironment env) {
      if (env.IsDevelopment()) {
        app.UseDeveloperExceptionPage();
      }

      app.UseRouting();
      app.UseCorsOption();
      app.UseStaticFiles();
      app.UseEndpoints(builder => builder.MapControllers());
    }
  }
}
