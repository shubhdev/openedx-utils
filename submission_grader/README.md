### About

This is the backend code for external grader, used for grading coding assignments.
Open Edx uses "Xqueues" for external grading.
Please look at [Xqueue Introduction](http://edx-partner-course-staff.readthedocs.org/en/latest/exercises_tools/external_graders.html) before reading further.

### Xqueue Configuration
To understand how xqueues work and interact with external graders, checkout the
XQueue [github repo](https://github.com/edx/xqueue).Just reading the README would suffice for now.

To configure/register a xqueue go to /edx/app/xqueue/xqueue.env.json and modify the "XQUEUES" object to add/delete a xqueue or change the IP or port.

**For example:**
```
"XQUEUES": {
    "certificates": null,
    "edX-Open_DemoX": "http://localhost:18050",
    "MAL201": "http://localhost:1710",
    "open-ended": null,
    "open-ended-message": null,
    "test-pull": null
}  
```
The json key is the name of the Xqueue and the value is the IP:PORT of the external grader. The value is **null** when the grader is an [active grader](https://github.com/edx/xqueue#active-graders) as opposed to a [passive grader](https://github.com/edx/xqueue#passive-graders).

Generally the convention is to register a Xqueue for each course.

This repo contains a python script [grader.py](grader.py) that runs a server which listens on whatever port the xqueue will post the submissions to.

### Implementation

**NOTE** : The grader in this repo as implemented in [grader.py](grader.py) is a passive grader.

[grader.py](grader.py) is self explainatory.The server listens at a port and whenever it receives a submission it runs the bash script [grader.sh](grader.sh) to score the submissions.

Before grading the submissions, the test cases are downloaded from the url provided by the instructors in [grader_playload](http://edx-partner-course-staff.readthedocs.org/en/latest/exercises_tools/external_graders.html#create-a-code-response-problem).

These urls should contain compressed files.

We also added some other things which are sent to the external grader, such as language of submission and whether the submission is a trial run or not.
To understand the changes we made, please read CHANGES.md in the [main repo](https://github.com/shubhdev/openedx).

Submissions which are trial runs are run on sample test cases while others are evaluated on main testcases.

The bash script compiles and executes the code submission.Finally it returns a JSON string which contains the result for each test case.

Currently, the execution result is matched with the test cases using the unix command line utility "***cmp***".
However we also want to enable the instructor to provide a script which will score the results based on the output generated. (for instance when there can be more than one correct outputs. such as if the task is to print an even number.)

Secondly, cmp might not be ideal since it considers extra spaces and newlines.Students might get "incorrect" if they have an extra newline or space anywhere.

## TODO
* Modify the check method in grader.sh to correct for extra newlines and spaces.Also allow for instructor provided checker script.Then that checker script can be used in place of **cmp** if need be.
* when the bash script is executed, configure appropriate permissions so that any malicious code  is not able to do any harm to the server. You will be running the external grader on a separate machine, but still someone can harm the system very easily.
See this [SO question](http://stackoverflow.com/questions/478898/how-to-execute-a-command-and-get-output-of-command-within-c).
