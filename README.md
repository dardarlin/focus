# focus.js
an engine to manage focus auto on  tv
***

# Usage
1. you should include the [jquery](http://jquery.com/)
2. include the file 'focus.min.js' or 'focus.js' in your html
3. use these attribute in your html element

<pre><code>   data-focus-level="your level name"
   data-focus-group="your group name"
   data-focus-next="define your next focus element"
</code></pre>

4. to see the engine interface,please see test/index.html    
***
# principle

* 1.to use this engine,your html is devide by level group and element,the different level's element can't be focus only when you setFocus to this level's element


* 2.when you don't want to manage focus by default in current element,you can sign your element with attribute like 'data-focus-next='{"left":"#item1"}''


* 3.when the focus is exists,this engine will use focus cache as default.for example: your last focus element is focused with pressing directive 'left',and then you press diretive 'right' on current element,it will just focus on last focus element instead of searching on current group.

***
#Author
astinfun

[github](https://github.com/astinfun/focus)
***
#License
The MIT License (MIT)

Copyright (c) 2016 veryfun

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
