This file contains the taks we were assigned as a part of our summer project, the changes we have made in the edx-platform repo , explaining them,and some TODOs if present.

## TASKS
We were assigned the following tasks during the course of our project.

##### Get familiar with open edx and install an open edx instance on Baadal VM
You can find a guide on how to get started with open edx in [INTRO.md](/documentation/INTRO.md). It contains some useful links.

##### Understand the various problem types and other components supported by open-edx.
Visit this link to learn about content creation on open edx : http://edx-partner-course-staff.readthedocs.org/en/latest/creating_content/index.html

To lean about problem components visit http://edx-partner-course-staff.readthedocs.org/en/latest/creating_content/create_problem.html
Open edx supports a variety of problem types, which are divided into two categories:
Basic and Advanced.

You can find the documentation for the various problem types at this link : http://edx-partner-course-staff.readthedocs.org/en/latest/exercises_tools/index.html

Our main task was to understand how to create *coding assignments* in open edx studio.
As seen in the above link, open edx has a class of problems which can be graded by an [external grader](http://edx-partner-course-staff.readthedocs.org/en/latest/exercises_tools/external_graders.html).

According to the above link, this is the way to create problems which require code submission and testing.
##### Add template for coding problems
If you have read about creating problem components in studio, you must be knowing that openedx stores problems as xml code. And to hence to create problems you have to write xml. Fortunately, for most problem types when adding a new problem in studio, you can select from some predefined templates. As shown here:

![alt-text](/documentation/images/problem_templates.png)

You can edit the sample xml code to change the problem acc. to your needs.
However to create problem types requiring external grader, one has to start from a blank editor (mentioned in the link describing external grader problems).
Clearly,this is not convinient for instructors.

Thus, the first step was to add a sample template for coding problem types.
As it turned out, this was pretty easy to do. Add an appropriate *.yaml* file [here](https://github.com/shubhdev/openedx/tree/master/common/lib/xmodule/xmodule/templates/problem) and you are done. We added the file [code_input.yaml](https://github.com/shubhdev/openedx/blob/master/common/lib/xmodule/xmodule/templates/problem/code_input.yaml).

Now a template for coding problems appears when adding a new problem component.

![new_template](/documentation/images/new_template.png).

##### Improve the features of coding input problems
The original coding input problems were very limited in features.We added the following features.
##### Allowing Multiple Languages
Open edx uses [CodeMirror](https://codemirror.net/) as the editor for all purposes, even for the input field for coding problems.
However originally,the input field did not support multiple languages. As seen [here](http://edx-partner-course-staff.readthedocs.org/en/latest/exercises_tools/external_graders.html#create-a-code-response-problem) in the example code

```
<problem display_name="Problem 6">
   <text>
       <p>Write a program that prints "hello world".</p>
   </text>
   <coderesponse queuename="my_course_queue">
       <textbox rows="10" cols="80" mode="python" tabsize="4"/>
       <codeparam>
           <initial_display>
             # students please write your program here
             print ""
           </initial_display>
           <answer_display>
             print "hello world"
           </answer_display>
           <grader_payload>
           {"output": "hello world", "max_length": 2}
           </grader_payload>
       </codeparam>
   </coderesponse>
</problem>
```
the "textbox" tag allows only a single mode, thus restricting the allowed languages to a single language.

We changed this by adding a 'select' tag to the problem html.The aim was that whenever a new language is selected, change the mode of the textarea using *javascript*.

The file : [display.coffee](https://github.com/shubhdev/openedx/blob/master/common/lib/xmodule/xmodule/js/src/capa/display.coffee) contains the frontend javascript logic for all problems.

We added code to the 'bind' method to change the editor mode whenever a new language is selected using *jquery* .
So now, a sample problem looked like this:

```
<problem>
      <text>
        <h1><b>Statement</b></h1>
        <p>
          This is a sample coding problem. Write a program to print "Hello, World!".
        </p>
        <h1><b>Output</b></h1>
        <p>
          Print "Hello,World!" (without the quotes).
        </p>
      </text>
      <select class="lang-options" style="margin-left:90%">
        <option value="text/x-c++src">cpp</option>
        <option value="python">python</option>
      </select>
      <span></span>
      <coderesponse queuename="cpp-queue">
        <textbox mode="text/x-c++src" tabsize="4" />
        <codeparam>
          <initial_display><![CDATA[ 
          ]]> 
          </initial_display>
          <grader_payload>
            {
              "problem_type": "Check",
              "grader"      : "http://example.domain/problemid_check.py"
            }
        </grader_payload>
        </codeparam>
      </coderesponse>
      </problem>
```
The above problem allows c++ and python as options.The option values ie ["text/x-c++src","python"] are specific to CodeMirror syntax.

##### Allowing for code snippets
This feature allows to mention code-snippets, which will be highlighted in the selected language.
Again the changes were in [display.coffee](https://github.com/shubhdev/openedx/blob/master/common/lib/xmodule/xmodule/js/src/capa/display.coffee) in the 'bind' method.*jquery* was used to create codemirror instances for all tags with ids "code-snippet"

With the two features (multiple languages,code-snippets) added to the front end,some changes had to be made in the backend to send the language used and the complete code (codesnippets + code entered by student) to the external grader.

For a problem,the flow of information is as follows:

*diplay.coffee* -> [*capa_module.py*](https://github.com/shubhdev/openedx/blob/master/common/lib/xmodule/xmodule/capa_module.py) -> [*capa_base.py*](https://github.com/shubhdev/openedx/blob/master/common/lib/xmodule/xmodule/capa_base.py) -> [*capa_problem.py*](https://github.com/shubhdev/openedx/blob/master/common/lib/capa/capa/capa_problem.py) -> [*responsetypes.py*](https://github.com/shubhdev/openedx/blob/master/common/lib/capa/capa/responsetypes.py).

We made appropriate changes in these files so that the additional info reaches the external grader.(**Most** of the changes have been marked by comments which contain "edxOnBaadal" in them to make them easy to locate)

##### Enable creating problems using forms
Since writing xml is inconvinient, we have introduced a facility to make coding problems using forms:

![problem_creation_using_form](/documentation/images/form.png)

The correponding changes were made in https://github.com/shubhdev/openedx/blob/master/common/lib/xmodule/xmodule/js/src/problem/edit.coffee.
##### Allow students to test their submission before submitting

We have added the feature which allows students to 'trial run' their answers.
If the instructor allows 'trial' option in problem settings(enabled by default), the students see a 'Test' button.

Changes were made in display.coffee,capa_base.py,responsetypes. py,[problem.html](https://github.com/shubhdev/openedx/blob/master/lms/templates/problem.html),[display.scss](https://github.com/shubhdev/openedx/blob/master/common/lib/xmodule/xmodule/css/capa/display.scss).

##### CodeMirror Keylogging

We had to log the keystrokes of students in codemirror editor and then store it in a database.
The keylogger exists separately in this repo https://github.com/shubhdev/openedx-utils/blob/master/CodeMirror%20key%20logger/cm_keylogger.coffee

The usage can be seen from main.js.
Though this code has not been introduced in main repo, because of some pending design decisions. However when introduced the coffeescript part should be changes in [display.coffee](https://github.com/shubhdev/openedx/blob/master/common/lib/xmodule/xmodule/js/src/capa/display.coffee) and the backend would have to be handle according to the info flow described earlier.

##### External grading script
A script to scrore the student submissions to the coding problems exists in https://github.com/shubhdev/openedx-utils/tree/master/submission_grader.
However there are some TODOs, like adding support for more languages, making the script more robust(error handling),and deciding on the scoring schema.


