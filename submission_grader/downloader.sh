#erro codes
#0:success
#1:unable to download
#2:invalid test cases
url=$1
$(wget -N $url > /dev/null 2>&1 )
res=$?
if [ $res -ne 0 ]
  then printf "1"
else
  file_name=$(basename $url)
  $(tar -zxvf $file_name >/dev/null 2>&1)
  if [ $? -ne 0 ]; then
    #file could not be extracted, return 2
    printf "2"
  else
    printf "0"
    rm $file_name 
  fi 
fi

