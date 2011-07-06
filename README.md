The Carpus Friendly Password Generator
======================================

The Carpus Friendly Password Generator uses a quantitative typing effort model to generate secure
passwords that are measurably easy-to-type (a.k.a. [carpus](http://en.wikipedia.org/wiki/Carpus)
friendly) on standard QWERTY keyboards.

It works by generating a random password, and then replacing random characters until the overall
typing effort of the password is below the desired value. There's currently a [web
interface](http://jnrbsn.github.com/cfpg) written in JavaScript (in the `gh-pages` branch of the git
repository) and a PHP function for integration with your apps (in the `master` branch). I plan on
porting it to other language as time allows. if you want to contribute a port in an additional
language, you can fork the [GitHub project](https://github.com/jnrbsn/cfpg) and submit a pull
request.

Typing effort of the generated passwords is calculated based on the [CarpalX Typing Effort
Model](http://mkweb.bcgsc.ca/carpalx/?typing_effort). Some of the logic used in CFPG was derived
from code in [CarpalX](http://mkweb.bcgsc.ca/carpalx) which is copyright 2002-2009 Martin Krzywinski
&lt;martink at bcgsc dot ca&gt;.

Where should you start? Check out the web interface at <http://jnrbsn.github.com/cfpg>
