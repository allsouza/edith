Edith - A slack assistant
==============
Intro
------
My team uses our slack channel to ask teammates to review pull requests so we can merge our changes.  Traditionally those requests are made by writing a normal message with the link to the PR to be reviewed.  Recently I leveraged a slack workflow to standardize those requests and although that works better than the traditional method, I observed a few things that could be improved, mainly: notifying OP when the PR is reviewed or approved and keeping track of review requests still open.  To that end, I used Slack’s Bolt framework to build Edith.

What is Edith?
-------
A slack app built using JavaScript and Slack’s Bolt framework with a NoSQL database(MongoDB) to keep track of open requests.  It can be added to a slack channel to provide two functions for now.  Additional functions can be added in the future depending on teams’ needs.

Functions
------
As of now, Edith has two primary functions that work via slash command or a button in the app home.
### Slash Commands
These commands are available in the channels to which the app has been added.
#### /pr_review

A modal for creating a pull request review request that is made up of five fields:
* PR Summary - a summary of the changes made to help others know what they are reviewing.
* Service - Name of the service the change is going to take place
* PR Link - Link to the remote repo where PR was created (BitBucket, GitHub, etc...)
* PR Notes - Additional information on the change will be displayed as a thread message.
* PR Review Request to be posted on - Channel where the request will be posted to, defaults to the channel where slash command was used.
Once the request is submitted the request information is encrypted and saved to the database and a message is sent to the channel notifying peers of the request.

Teammates can now click the button to view the PR on their browser, react with the emojis :reviewed: or :approved: and the original poster will be notified that the user had taken action:

Once the PR is merged the OP can then click the ‘Merged’ button to close the request.  Closing the request causes it to be deleted from the database while saving anonymous statistics to the stats table.

#### /view_prs

A modal that displays all open review requests for the channel and also channel stats.  For each request, the status, summary, creation and open time and notes will be displayed along with action options.  The options for each request will vary based on whether the user is the author or reviewer for the request.

The author will have the option to open the link or mark the request as ‘Merged’, while reviewers will have the option to open the link or mark the request as ‘Reviewed’ or ‘Approved’.

### App Home buttons
When accessing the app home it lists the available functions of the app and includes a button to trigger each function:
#### Create Request
Opens the create PR Review Request modal, behaves the same as the slash command with one exception: Since this is triggered from the App Home the user needs to select which channel to post the request to from the dropdown menu at the bottom.
#### View Requests
Opens the same modal as the /view_prs command, but lists all open requests in all the channels the user is a part of, separated by channel.

Database
-----
I am using MongoDB, a noSQL database, to store the request information.  Each document has 8 fields, 4 of which are encrypted using an AES(Advanced Encryption Standard) encryption algorithm to keep product data private in the database:
* summary - encrypted
* notes - encrypted
* service - encrypted
* link - encrypted
* status - open, reviewed, or approved.  Open is the creation default and status will vary between reviewed and approved depending on what the last reaction was, allowing a request to be marked as reviewed even after a user approved it.
* author - Slack user id of the author of the request
* created_at - Timestamp of when the request was created
* pr_post_id - Slack message id for the message posted to the channel.


The data is encrypted using a custom encryption key before being saved to the database and decrypted with the same key after being queried from the database.
Once the request is marked as done the entry is deleted from the database and some statistical information is updated in a stats table.  
The stats table is made up of a document for each channel the app is a part of.  Each document is made up of 4 fields:
* channel_id - Slack channel id
* count - count of requests created in the channel
* avg_first_interaction_in_secs - Average time for first interaction with requests in the channel
* avg_close_in_secs - Average time for closing a request in the channel.
