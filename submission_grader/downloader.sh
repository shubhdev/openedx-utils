url=$1
$(wget -N $url > /dev/null 2>&1 )
res=$?
if [ $res -ne 0 ]
  then echo "0"
  else echo "1"
fi
