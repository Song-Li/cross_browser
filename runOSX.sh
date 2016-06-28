#!/bin/bash
caskPath="/usr/local/Caskroom"
defaultPath="/Applications"
url="http://mf.songli.us/show/?user_id="
safari="/Applications/Safari.app"
ffName="Firefox.app"
chromeName="Google\ Chrome.app"

function installBrew() {
  if hash brew 2>/dev/null; then
    echo ""
  else
    xcode-select --install
    ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
  fi
}


chrome="$(find ${defaultPath} -maxdepth 1 -type d -name "${chromeName}")"
firefox="$(find ${defaultPath} -maxdepth 1 -type d -name ${ffName})"

if [[ -z ${chrome} ]]; then
  installBrew
  brew cask install google-chrome
  chrome="$(find ${caskPath} -type d -name "${chromeName}")"
fi

if [[ -z ${firefox} ]]; then
  installBrew
  brew cask install firefox
  firefox="$(find ${caskPath} -type d -name ${ffName})"
fi

user_id="$(curl 184.73.16.65/getid.py)"

open -a "${chrome}" "${url}${user_id}"
open -a "${safari}" "${url}${user_id}"
open -a "${firefox}" "${url}${user_id}"