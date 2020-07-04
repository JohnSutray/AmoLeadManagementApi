FROM mcr.microsoft.com/dotnet/core/sdk:3.1 AS builder
WORKDIR /sources

COPY *.csproj .
RUN dotnet restore

COPY . .
RUN dotnet publish --output /app/ --configuration Release

FROM mcr.microsoft.com/dotnet/core/aspnet:3.1
WORKDIR /app
COPY --from=builder /app .

CMD ["dotnet", "AmoLeadManagementApi.dll"]
