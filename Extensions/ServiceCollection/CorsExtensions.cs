using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Cors.Infrastructure;

namespace AmoLeadManagementApi.Extensions.ServiceCollection {
  public static class CorsExtensions {
    public static IApplicationBuilder UseCorsOption(this IApplicationBuilder applicationBuilder) =>
      applicationBuilder.UseCors(ConfigureCors);

    private static void ConfigureCors(CorsPolicyBuilder builder) => builder
      .AllowAnyHeader()
      .AllowAnyMethod()
      .AllowAnyOrigin();
  }
}