#!/bin/bash
language=$1
tests=$2
source_code=$3
echo "lang:$language,testcases:$tests"
compile(){
  case $language in
    "c++")err=$(g++ -x c++ prog -o progc 2>&1);;
    "python2")err=$(python2 -m py_compile prog 2>&1);;
  esac
}
execute(){
  #echo $file
  #echo $output_file
  case $language in
    "c++")err=$(./progc <$file >$output_file);;
    "python2")err=$(python2 progc <$file >$output_file);;
  esac
}
compile
if [ $? -ne 0 ]; then
  #error codes:
  #0 : success
  #1 : compilation error
  #2 : runtime error
  echo $(echo $err | cut -c-2048)
else
  for file in $(find /tests -name "input*.dat" -type f); do
    output_file=${file/input/res}
    execute
    #check if there was any runtime error
    if [ $? -ne 0 ]; then
      echo "Runtime Error on testcase: $file"
      continue
    fi
    expected_output=${file/input/out}
    $(cmp $expected_output $output_file >/dev/null 2>&1)
    if [ $? -ne 0 ]; then
       echo "wrong answer on testcase: $file"
    else
       echo "test case: $file passed"
    fi
    done
  echo "success in running"
fi
