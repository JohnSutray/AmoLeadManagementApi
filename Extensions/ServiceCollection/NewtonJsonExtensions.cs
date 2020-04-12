using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.DependencyInjection;
using Newtonsoft.Json;

namespace AmoLeadManagementApi.Extensions.ServiceCollection {
  public static partial class ServiceCollectionExtensions {
    public static IServiceCollection AddNewtonJsonServices(this IMvcBuilder builder)
      => builder.AddNewtonsoftJson(ConfigureJson).Services;

    private static void ConfigureJson(MvcNewtonsoftJsonOptions options) {
      options.SerializerSettings.ReferenceLoopHandling = ReferenceLoopHandling.Ignore;
    }
  }
}