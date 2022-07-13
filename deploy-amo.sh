#!/usr/bin/env bash

api_repo="AmoLeadManagementApi"
api_container_directory="/var/www/amo"
DOTNET_SDKS=$(dotnet --list-sdks)
amo_service_file="/etc/systemd/system/amo.service"
package_path="$api_container_directory/bin/Release/netcoreapp3.1/publish/$api_repo.dll"


if [[ ! -d "$api_container_directory" ]]
    then mkdir -p $api_container_directory 
fi

if [[ ! -f $amo_service_file ]]
	then echo "
[Unit]
Description=Amo .net api

[Service]
WorkingDirectory=/var/www/amo/
ExecStart=/usr/bin/dotnet $package_path
Restart=always
# Restart service after 10 seconds if the dotnet service crashes:
RestartSec=10
SyslogIdentifier=amo
User=systemd-resolve
Environment=AMO_DOMAIN=oknaramy;AMO_LOGIN=7963985@bk.ru;AMO_HASH=f0aaec1a024a566ef6503bf4bdef8bdb940e2de8;

[Install]
WantedBy=multi-user.target
" > $amo_service_file
fi

if [[ ! ($DOTNET_SDKS == *"3.1"*) ]]; then
	wget -q https://packages.microsoft.com/config/ubuntu/18.04/packages-microsoft-prod.deb
	dpkg -i packages-microsoft-prod.deb
    add-apt-repository universe
	apt-get install apt-transport-https
    apt-get update
	yes "yes" | apt-get install dotnet-sdk-3.1
fi

service_enabled=$(systemctl is-enabled amo.service)

if [[ ! ($service_enabled == *"enabled"*) ]]; then
  systemctl enable amo.service
fi

systemctl stop amo.service

rm -rf "$api_container_directory"
git clone "https://johnsutray:Peaceofl1fe@github.com/JohnSutray/$api_repo" "$api_container_directory"
cd $api_container_directory

dotnet publish --configuration Release

systemctl start amo.service
