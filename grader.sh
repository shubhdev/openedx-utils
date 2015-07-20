language=$1
tests=$2
source_code=$3
echo "lang:$language,testcases:$tests"
compile(){
$(g++ -x c++ prog -o bin >/dev/null 2>&1 )
}
execute(){
  #echo $file
  #echo $output_file
  $(./bin <$file >$output_file)
}
compile
if [ $? -ne 0 ]; then 
  echo "compilation failed"
else 
  for file in $(find -name input*.dat -type f); do
    output_file=${file/input/res}
    execute
    #TODO check if there was any runtime error
    expected_output=${file/input/out}
    $(cmp $expected_output $output_file >/dev/null 2>&1)
    if [ $? -ne 0 ]; then
       echo "wrong answer!!"
    else
       echo "test case : $file passed"
    fi
    done  
  echo "success in running" 
fi
