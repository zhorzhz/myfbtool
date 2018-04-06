angular.module('Chat', [])
.controller('ChatController', function($scope) {
    const socket    = io("https://myfbtool.com:3000");

    $scope.active_user = {
        id: 3301,
        first_name  : "...",
        profile_pic : "https://steembottracker.com/img/bot_logo.png",
    };
    $scope.active_messages = [];
    $scope.response = "";

    $scope.received_messages    = 0;
    $scope.sent_messages        = 0;

    socket.on("receiver", (data) => {

        if($scope.active_user.id !== data.sender && data.sender !== "") {
            $.ajax({
                url: `https://graph.facebook.com/v2.6/${data.sender}?fields=first_name,last_name,profile_pic&access_token=EAAClceU7X3IBAEMTVjQy7plqRcqZCYofp2P10QppftVjPZBkV6eJ6YTgJIM3fF4phZCWcHhngOyWQnOt03gIxnyh7LZBD9qfJJG3oesJSxfqCGVoNRPNe51ZCbFYeWc61TwwuQuxkpuceVnWnQ9XJEI0kZCd6v5Wndi7Be0lnECZBx49owOcROh`,
                success: (user_received) => {
                    console.log("user", user_received);
                    $scope.$apply(function () {
                        $scope.active_user = user_received;
                    });
                }
            })
        }

        add_message(data.text, data.sender);

        $scope.received_messages++;
    });

    $scope.send_message = function (text) {

        if(text.length === 0){
            return;
        }
        //-- Send message
        socket.emit("sender", {
            text        : text,
            recipient   : $scope.active_user.id,
        });

        // Use timeout with 0 to avoid from error of $scope.$apply
        setTimeout(() => add_message(text, 0), 0);

        //-- clear input
        $scope.response = "";
        $scope.sent_messages++;
    };

    //-- Update chat history
    const add_message = (text, sender) => {
        $scope.$apply(() => {
            $scope.active_messages.push({
                text,
                sender,
                time: moment().format("LT"),
            });
        });

        //-- scroll to bottom
        setTimeout(() => $(".chat-history").scrollTop(9999), 10);
    };

    const searchFilter = {
        options: { valueNames: ['name'] },
        init: function() {
            var userList = new List('people-list', this.options);
            var noItems = $('<li id="no-items-found">No items found</li>');

            userList.on('updated', function(list) {
                if (list.matchingItems.length === 0) {
                    $(list.list).append(noItems);
                } else {
                    noItems.detach();
                }
            });
        }
    };

    searchFilter.init();
});