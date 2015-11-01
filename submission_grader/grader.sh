#!/bin/bash
#error codes:
# 0 : success
# 1 : wrong answer
# 2 : runtime error
# 3 : time limit
#TODO put these error codes in a config file
language=$1
tests=$2
source_root=$3
time_limit=$4
#echo "lang:$language,testcases:$tests"
compile(){
  case $language in
    "cpp")err_msg=$(g++ -x c++ $source_root/prog -o $source_root/progc 2>&1);;
    "python2")err_msg=$(python2 -m py_compile $source_root/prog 2>&1);;
  esac
}
execute(){
  #echo $file
  #echo $output_file
  case $language in
    "cpp")$(timeout $time_limit $source_root/progc <$file >$output_file);;
    "python2")$(timeout $time_limit python2 $source_root/progc <$file >$output_file);;
  esac
  exec_result=$?
}
check(){
 #TODO add the option to do the comparision with user given checker.
 $(cmp $expected_output $output_file >/dev/null 2>&1)
 check_result=$?
}
#err_msg="\"\""
result="\"\""
#source_file="$source_root/prog"
compile
if [ $? -ne 0 ]; then
  err=1
  #echo "$err_msg"
else
  err=0
  result="["
  cnt=0
  for file in $(find $tests -name "input*.dat" -type f | sort); do
    cnt=$(($cnt+1))
    tmp=${file/input/res}
    output_file=${tmp/$tests/$source_root}
    #echo $output_file
    #echo "$output_file" >> log.txt
    execute
    #check if there was any runtime error
    if [ $exec_result -ne 0 ]; then
      #echo "Runtime Error on testcase: $file"
      #echo $exec_result
      if [ $exec_result -eq 124 ]; then
        res=3
      else
        res=2
      fi
    else
      expected_output=${file/input/out}
      check
      if [ $check_result -ne 0 ]; then
        #echo "wrong answer on testcase: $file"
        res=1
      else
        #echo "test case: $file passed"
        res=0
      fi
     fi
     if [ $cnt -ne 1 ];then
       result="$result,$res"
     else
       result="$result$res"
     fi
   done
  result="$result]"
  fi
esc_err_msg=${err_msg//"\""/""}
#echo "$esc_err_msg"
result="{\"error\":$err,\"err_msg\":\"$esc_err_msg\",\"result\":$result}"
printf "$result"
  #echo "success in running
