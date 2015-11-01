import BaseHTTPServer
import json
import os
import time
import random
import subprocess
import re
"""
response structure from the xqueue
{
    "xqueue_body":{
        "student_response":string     ##the code submitted by the student as a string
        "submission_info":{
            "trial":boolean,          ##whether the submission is a trial submission( to be run on sample test cases)
            "lang":string               ##language of the submission
        },
        "grader_payload":{
            "main_tests":string,      ##url of the main test cases
            "sample_tests":string     ##url of the sample test cases
        }
    },
    "student_info": {
            'anonymous_student_id': anonymous_student_id,
            'submission_time': qtime,
    }
}

There might be fields in the main json object other than xqueue_body, but we dont need them.
More can be found out about the structure of the xqueue response from the file:
openedx/common/lib/capa/capa/capa_base.py in the class "CodeResponse"

"""
class HTTPHandler(BaseHTTPServer.BaseHTTPRequestHandler):

    def do_POST(self):
        body_len = int(self.headers.getheader('content-length', 0))
        body_content = self.rfile.read(body_len)
        print (self.headers.getheader('content-type'))
        print ("recieved: {0}".format(body_content))
        submission_info = preprocess(body_content)
        result = grade(submission_info)
        self.send_response(200)
        self.end_headers()
        self.wfile.write(process_result(result))

def preprocess(body_content):
    json_object = json.loads(body_content)
    json_object = json.loads(json_object["xqueue_body"])
    #print json_object
    submission_info = json.loads(json_object["submission_info"])
    student_response = json_object["student_response"]
    grader_payload = json.loads(json_object["grader_payload"])
    #download the testcases, the grader payload should contain the links to the testcases
    #TODO do this in a try,exception body to ensure the validity of the json
    testfiles_main = grader_payload["main_tests"]
    testfiles_trial = grader_payload["sample_tests"]
    main_tests = download(testfiles_main)
    sample_tests = download(testfiles_trial)
    is_trial = submission_info["trial"]
    tests = ""
    if is_trial:
         tests = sample_tests
    else:
        tests = main_tests
    lang = submission_info["lang"]
    #return the preprocessing result as a json string
    #TODO take time_limit input from instructor, currently hardcoded as 1s
    time_limit = "1"
    info = {
        "lang": lang,
        "submission": student_response,
        "tests": tests,
        "time_limit": time_limit
    }
    #print info
    return info
"""
downloads file associated with the link to the current directory,
the bash script returns some predefined codes on error. if there was a download error, check if an older version exists.
If yes then use that else return empty string
"""
def download(url):
    p = subprocess.check_output(["bash","downloader.sh",url])
    #get the filename from the url
    filen, ext = os.path.splitext(url.split('/')[-1])
    print p
    if p == "1":
        if os.path.isdir(filen): return (0,filen)
    	else : return (1,"")
    if p == "2": return (2,"")

    print ("downloaded"+filen)
    return (0,filen)

# returns a random folder name to be used by the grader
def get_random_folder_name():
    curr_time = str(int(time.time()*1000))
    random_num = int(random.random()*1000)
    return curr_time+'_'+str(random_num)
def grade(submission_info):
    student_response = submission_info["submission"]
    lang = submission_info["lang"]
    err_code,tests = submission_info["tests"]           #CARE,python tuples are converted to lists in json loads,
                                                        #but since we are directly passing json object, it doesnt matter
    if err_code != 0 :
        if err_code == 1 : err_msg = "Test Cases not available, please contact course staff"
        else : err_msg = "Invalid testcases, please contact course staff"
        return {'err_msg':err_msg,'error':1,'result':""}
    else:
    	time_limit = submission_info['time_limit']
    	#make a new temporary folder which will hold the student submission source code and the output files.
    	#the folder is made as there can be more than one simultaneous checking of submissions, and having files in a common directory
    	#will lead to a data race condition
    	#there can be more than one ways to get a folder name which is unique to each submission,here we will concatenate
    	#the current unix timestamp with a random number
    	#in the rare case that 2 submissions are being processed at exactly the same timestamp, the random number will with very high probability
    	#ensure that the name is unique
    	source_directory = get_random_folder_name()
    	#check if the folder with given name already exists(highly improbable), assign a new folder name if it does
    	while os.path.isdir(source_directory):source_directory=get_random_folder_name()
   	os.mkdir(source_directory)
    	source_file = open("{0}/prog".format(source_directory), 'w')
    	source_file.write(student_response)
    	source_file.close()

    	result = subprocess.check_output(["bash","grader.sh",lang,tests,source_directory,time_limit])  
    	#print result
    	result = json.loads(result.replace('\n','\\n'))    #this is necessary because the output of the bash script may contain newline,
       	                                                   #which is percived as is in python string.
							   # Read http://stackoverflow.com/questions/22394235/invalid-control-character-with-python-json-loads
    	return result

"""
contains the logic to grade the submissions based on the result of the testcases
TODO ask the grading logic from the instructor, either scoring is done for each testcase or for all the testcases combined.
Either way, calculate the final score
"""
def process_result(result):
    print (json.dumps(result))
    #return json.dumps({"correct":True,"score":0,"msg":"test run, contact admins"})
    if (result["error"] != 0):
        correct = False
        score = 0
        message = result["err_msg"]
    else:
        correct = True
        cnt = 0
        result_codes = result['result']
        #TODO decide on a scoring strategy.There can be marking for individual test cases or
        #all combined marking for all testcases
        #Currently, this is individual scoring assuming equal weightage for each test case
        for result_code in result_codes :
            if result_code != 0 : cnt+=1.0
	print (cnt,len(result_codes))
        score = cnt/len(result_codes)
	message = json.dumps(result["result"])


    result = {}
    result.update({"correct": correct, "score": score, "msg": message })
    result = json.dumps(result)
    print result
    return result

def test_random_folder_name():
    for i in xrange(0,10):
        print get_random_folder_name()
        time.sleep(0.05)
def test_grading():
    test_submission ={
        "submission":"#include<iostream>\nint main(){int x;std::cin>>x;std::cout<<x;return 0;}",
        "lang":"python2",
        "tests":"tests"
    }
    print grade(test_submission)
def test_download():
    url = raw_input("enter the url")
    print "downloading from "+url
    filename = download(url)
    if not filename == "":
        print ("File {filename} successfully downloaded").format(filename= filename)
    else:
        print ("Error while downloading")
if __name__ == "__main__":
    print ("Welcome!")
    #test_random_folder_name()
    #test_grading()
    server = BaseHTTPServer.HTTPServer(("localhost", 1710), HTTPHandler)
    server.serve_forever()
