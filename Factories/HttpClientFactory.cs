using System;
using System.Net.Http;
using Microsoft.Extensions.DependencyInjection;

namespace AmoLeadManagementApi.Factories {
  public static class HttpClientFactory {
    public static HttpClient Create(IServiceProvider serviceProvider) => serviceProvider
      .GetRequiredService<IHttpClientFactory>()
      .CreateClient();
  }
}