
# Task 6

Web-application (you the stack of your group).

The application is a "collaborative drawing board" for everyone (you may think about Google Jamboard as an example). 

No registration or authentication, all users have immediate access to the "boards" list (the user only provides arbitrary nick-name to enter).

Each user can create board or join existing boards.

Several users can draw on the same board simultaneously. When somebody draw something, it appears to other users "immediately" (there may be a slight delay, you can either poll the server or preferably use websockets). 

Everything drawn on the board is stored "forever" (if user joins this board later, he/she sees everything what was created before).

Drawing area should fill the whole window (except, probably, the tool panel) and scale/scroll adequately.

Optional requirement (each will increase the grade):
* Ability to erase previously draw elements.
* Several tools ("text", "rectangle", "circle", etc.) with colors.
* Preview thumbnail images in the board list.
* Export to jpeg option.

> ***The most important part is how accurate will your app looks — does it look like a ready-to-market solution or like a student-practice?***

Please, note that in the Task #6 the main requirement is to make your application "life-like". Implementation of the very basic, bare minimum requirements will be accepted, but won't get any good grade. Let's try to think what is assumed, what's expected from such kind of application:
1. Board gallery should support some kind of paging, be filterable and searcheable.
1. Each boad should have some kind of "tool panel" with **different** tools with contextual **settings** as well as Undo/Redo functionality (three fixed pencils are not enough).
1. It's a very good idea to have a way to see who is connected (names, number of people). It's also a great idea to have some kind of statistics (number of layers, objects, memory footprint).
1. Drawn objects should be editable (move, rotate, scale, z-index operations, delete).
Without such capabilities it's middle-shool project "I know WebSockets", not an application.

P.S. Yes, "it was not in the requirements". Well, that's life. The only constant thing is change.