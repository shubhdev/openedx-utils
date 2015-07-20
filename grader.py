import BaseHTTPServer
import json
import os
import subprocess
import re
"""
response structure from the xqueue
{
student_response,
submission_info,
grader_payload
}
"""
class HTTPHandler(BaseHTTPServer.BaseHTTPRequestHandler):

    def do_POST(self):
        body_len = int(self.headers.getheader('content-length', 0))
        body_content = self.rfile.read(body_len)
        submission = preprocess(body_content)
        result = grade(submission)
        self.send_response(200)
        self.end_headers()
        self.wfile.write(result)

def preprocess(body_content):
    json_object = json.loads(body_content)
    json_object = json.loads(json_object["xqueue_body"])
    submission_info = json.loads(json_object["submission_info"])
    student_response = json_object["student_response"]
    grader_payload = json.loads(json_object["grader_payload"])
    #download the testcases, the grader payload should contain the links to the testcases
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
    result = {
        "lang": lang,
        "submission": student_response,
        "tests": tests
    }
    return json.dumps(result)
"""
downloads file associated with the link to the current directory
"""
def download(url):
    p = subprocess.check_output(["bash","downloader.sh",url])
    print p
    if not p == "1\n":
        return ""
    return url.split('/')[-1]
def grade(submission):
    submission = json.loads(submission)
    student_response = submission["submission"]
    lang = submission["lang"]
    tests = submission["tests"]
    source_file = open("prog", 'w')
    source_file.write(student_response)
    source_file.close()
    result = subprocess.check_output(["bash","grader.sh",lang,tests,"prog"])
    result = json.loads(result)
    print result
    """
    p = subprocess.Popen(["javac", "/edx/java-grader/Program.java"], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    out, err = p.communicate()

    if (err != ""):
        result.update({"compile_error": err})
        result = process_result(result)
        return result
    else:
        result.update({"compile_error": 0})

    test_runner = problem_name["problem_name"] + "TestRunner"
    test_runner_java = "/edx/java-grader/" + test_runner + ".java"
    p = subprocess.Popen(["javac", "-classpath", "/edx/java-grader:/edx/java-grader/junit-4.11.jar:/edx/java-grader/hamcrest-core-1.3.jar", test_runner_java], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    out, err = p.communicate()
    p = subprocess.Popen(["java", "-classpath", "/edx/java-grader:/edx/java-grader/junit-4.11.jar:/edx/java-grader/hamcrest-core-1.3.jar", test_runner], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    out, err = p.communicate()
    out = re.split('\n', out)
    correct = out[len(out) - 2]

    if (correct == "true"):
        correct = True
    else:
        correct = False

    if (len(out) > 2):
        message = out[0]
    else:
        message = "Good job!"

    result.update({"correct": correct, "msg": message,})
    result = process_result(result)
    return result

def process_result(result):

    if (result["compile_error"] != 0):
        correct = False
        score = 0
        message = result["compile_error"]
    else:
        correct = result["correct"]
        message = result["msg"]

    if (correct == True):
        score = 1
    else:
        score = 0

    result = {}
    result.update({"correct": correct, "score": score, "msg": message })
    result = json.dumps(result)
    return result
"""
def test_grading():
    test_submission ={
        "submission":"#include<iostream>\nint main(){std::cout<<1;return 0;}"
        "lang":"c++"
        "tests":"testcases_dummy"
    }
    grade(test_submission)
if __name__ == "__main__":

    print ("Welcome!")
    url = raw_input("enter the url")
    print "downloading from "+url
    filename = download(url)
    if not filename == "":
        print ("File {filename} successfully downloaded").format(filename= filename)
    else:
        print ("Error while downloading")
    """server = BaseHTTPServer.HTTPServer(("localhost", 1710), HTTPHandler)
    server.serve_forever()
    """
