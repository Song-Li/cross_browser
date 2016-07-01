#!/bin/bash

defaultPath="/Applications"
url="http://mf.songli.us/show/?user_id="
safari="/Applications/Safari.app"
ffName="Firefox.app"
chromeName="Google\ Chrome.app"
currentPath="$(pwd)"

idFile="${currentPath}/uid.txt"
brewPATH="${currentPath}/brew-master/bin"
export PATH="${currentPath}/utils:${brewPATH}"

touch $idFile
function runTests () {
  chrome="$(find ${defaultPath} -maxdepth 1 -type d -name "${chromeName}")"
  firefox="$(find ${defaultPath} -maxdepth 1 -type d -name "${ffName}")"

  if [[ -z ${chrome} ]]; then
    brew cask install --appdir=${currentPath} google-chrome
    chrome="$(find ${currentPath} -maxdepth 1 -type d -name "${chromeName}")"
  fi

  if [[ -z ${firefox} ]]; then
    brew cask install --appdir=${currentPath} firefox
    firefox="$(find ${currentPath} -maxdepth 1 -type d -name "${ffName}")"
  fi

  user_id="$(cat $idFile)"
  if [[ -z ${user_id} ]]; then
    user_id="$(curl 184.73.16.65/getid.py)"
    echo ${user_id} > ${idFile}
  fi

  open -a "${chrome}" "${url}${user_id}&automated=true"
  open -a "${safari}" "${url}${user_id}&automated=true"
  open -a "${firefox}" "${url}${user_id}&automated=true"
}

runTests
