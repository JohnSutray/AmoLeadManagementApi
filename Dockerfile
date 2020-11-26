FROM node:12

COPY /integration-script .

RUN npm install
RUN npm run build

FROM mcr.microsoft.com/dotnet/core/sdk:3.1 AS builder
WORKDIR /sources

COPY *.csproj .
RUN dotnet restore

COPY . .
COPY --from=0 /dist /sources/wwwroot
RUN dotnet publish --output /app/ --configuration Release

FROM mcr.microsoft.com/dotnet/core/aspnet:3.1
WORKDIR /app
COPY --from=builder /app .

CMD ["dotnet", "AmoLeadManagementApi.dll"]
