@echo off
echo Paste the url here:
set /p url=
node index --url="%url%" --all