# SX

a simple shortcuter program!


## Usage

Create a `sx.conf` file in your Home Directory

and use the KeyValue shortcuts with 

```sh
sx hi
```

and in the config file is a KeyValue File. Entrys are seperated by `=`

```ini
# Lines with # are comments
hi=echo Hallo World
```


## SX Config

**There is the Option to add a Start Message to SX to customize it more!**

All SX Settings:

```ini
# Echo Commands before running them, true or false - Default is false
--echo-commands=false

# Enable Local Commands
# Option to enable local Command SX files in the current dir which will
# then be loaded
--enable-local-commands=false
# To decide if the Local or Global Commands should be used
# Default it false
--override-global-commands=false

# Option to change the Default Start Message to for example
# Set to true for this!
--overwrite-start-message=false

# Enter here the File name! Path starts in the Home Directory
--start-message-file=empty.txt

# Color for the Custom Start Message
# Default is White
# Options: White, Black, Red, Green, Yellow, Blue, Purple, Cyan
--start-message-color=White

# Change the Default Terminal Shell which is used on Windows
--windows-default-shell=cmd

# Change the Default Terminal Shell which is used on Linux
--linux-default-shell=bash

# Print the Version and the Buildtime after the Custom Start Message
# true, or false - Default is false
--add-info-to-start-message=true
```

A Warning will appear when a entry which is already for settigs used,
is trying to be used as a Command!


## Example Config

Here are some Example Configs for SX

- [My dotfiles](https://github.com/ShadowDara/dotfiles/tree/main/SX)
- [Full Config](/example_sx.conf)


## Local Config

There can although be a `localsx.conf` which will be loaded when it is
enabled in the global config.


## Info

SX uses [KVP](https://github.com/ShadowDara/KeyValueParser)
for the Config and Command System, which is a simple
Key Value Pair System Libary written by me. Feel free to optimize is,
if you want too.


## Multi

SX although has a multi Tools with a lot of options which can be called via SX,
but must be configured separately in the `sx.conf` file.

### NumberGuess Game

A simple Number Guessing Game which can be called with `multi --numberguess`
or `multi -n`

**Settings**

```ini
# Min and Max Number for the Game, Default is 1 and 1000
--numberguess-min=1
--numberguess-max=1000
```


## Widnows UI Wrapper

SX has little UI Wrapper with WinForms on Windows which can be used to call
shortcuts with a simple click on the Button

Commands which will be called on UI Button Click `sx --windows-sx-ui-button1`

So define these 16 Commands in your `sx.conf` file to use the UI
and set the Command you want to call on Button Click

```ini
# Button Callbacks for the Windows UI
--windows-sx-ui-button1=hi
--windows-sx-ui-button2=hi
--windows-sx-ui-button3=hi
--windows-sx-ui-button4=hi
--windows-sx-ui-button5=hi
--windows-sx-ui-button6=hi
--windows-sx-ui-button7=hi
--windows-sx-ui-button8=hi
--windows-sx-ui-button9=hi
--windows-sx-ui-button10=hi
--windows-sx-ui-button11=hi
--windows-sx-ui-button12=hi
--windows-sx-ui-button13=hi
--windows-sx-ui-button14=hi
--windows-sx-ui-button15=hi
--windows-sx-ui-button16=hi

# Buttom names for the Windows UI
# Use echo so that the Name will be retuned as Output and not
# as Command to call when the Button is Clicked
--windows-sx-ui-button1-name=echo Hallo World
--windows-sx-ui-button2-name=echo Hallo World
--windows-sx-ui-button3-name=echo Hallo World
--windows-sx-ui-button4-name=echo Hallo World
--windows-sx-ui-button5-name=echo Hallo World
--windows-sx-ui-button6-name=echo Hallo World
--windows-sx-ui-button7-name=echo Hallo World
--windows-sx-ui-button8-name=echo Hallo World
--windows-sx-ui-button9-name=echo Hallo World
--windows-sx-ui-button10-name=echo Hallo World
--windows-sx-ui-button11-name=echo Hallo World
--windows-sx-ui-button12-name=echo Hallo World
--windows-sx-ui-button13-name=echo Hallo World
--windows-sx-ui-button14-name=echo Hallo World
--windows-sx-ui-button15-name=echo Hallo World
--windows-sx-ui-button16-name=echo Hallo World

# To Disbale that this will open a new Terminal Window
# Default is true
--windows-sx-ui-button1-window=false
--windows-sx-ui-button2-window=false
--windows-sx-ui-button3-window=false
--windows-sx-ui-button4-window=false
--windows-sx-ui-button5-window=false
--windows-sx-ui-button6-window=false
--windows-sx-ui-button7-window=false
--windows-sx-ui-button8-window=false
--windows-sx-ui-button9-window=false
--windows-sx-ui-button10-window=false
--windows-sx-ui-button11-window=false
--windows-sx-ui-button12-window=false
--windows-sx-ui-button13-window=false
--windows-sx-ui-button14-window=false
--windows-sx-ui-button15-window=false
--windows-sx-ui-button16-window=false
```

SX must be in Path to use the UI, because the UI is a Wrapper
for SX and calls the Commands via SX


<!--
## Addons

### Foldertool Batch

A Batch Script to simply switch between different Folders in the
Terminal which is powered by SX and the SX Config System. You can find
it [here]()
-->
