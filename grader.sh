language=$1
tests=$2
source_code=$3
echo "lang:$language,testcases:$tests"
compile(){
  case $language in
    "c++")$(g++ -x c++ prog -o progc >/dev/null 2>&1 );;
    "python2")$(python2 -m py_compile prog);;
  esac
}
execute(){
  #echo $file
  #echo $output_file
  case $language in
    "c++")$(./progc <$file >$output_file);;
    "python2")$(python2 progc <$file >$output_file);;
  esac
}
compile
if [ $? -ne 0 ]; then
  echo "compilation failed"
else
  for file in $(find -name "input*.dat" -type f); do
    output_file=${file/input/res}
    execute
    #TODO check if there was any runtime error
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
