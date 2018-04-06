angular.module('Chat', [])
.controller('ChatController', function($scope) {
    const socket    = io("https://myfbtool.com:3000");

    $scope.active_user = {
        id: 3301,
        first_name  : "...",
        profile_pic : "https://steembottracker.com/img/bot_logo.png",
    };
    $scope.active_messages = [];
    $scope.users = {};
    $scope.response = "";

    $scope.received_messages    = 0;
    $scope.sent_messages        = 0;

    socket.on("receiver", (data) => {

        if(_.isEmpty($scope.users[data.sender]) && data.sender !== "") {
            return $.ajax({
                url: `https://graph.facebook.com/v2.6/${data.sender}?fields=first_name,last_name,profile_pic&access_token=EAAClceU7X3IBAEMTVjQy7plqRcqZCYofp2P10QppftVjPZBkV6eJ6YTgJIM3fF4phZCWcHhngOyWQnOt03gIxnyh7LZBD9qfJJG3oesJSxfqCGVoNRPNe51ZCbFYeWc61TwwuQuxkpuceVnWnQ9XJEI0kZCd6v5Wndi7Be0lnECZBx49owOcROh`,
                success: (user_received) => {
                    $scope.$apply(function () {
                        $scope.users[data.sender] = _.merge({ messages: [] }, user_received);
                        $scope.active_user = user_received;
                    });
                    add_message(data.text, data.sender);
                }
            })
        }

        if(!_.isEmpty($scope.users[data.sender]) && $scope.active_user.id !== data.sender && data.sender !== ""){
            //-- Update active user and messages
            $scope.active_user = _.find($scope.users, ["id", data.sender]);

            return add_message(data.text, data.sender);
        }

        add_message(data.text, data.sender);

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
    };

    $scope.choose_user = (user) => {
        $scope.active_user = user;
    };

    //-- Update chat history
    const add_message = (text, sender) => {
        $scope.$apply(() => {
            $scope.users[$scope.active_user.id].messages.push({
                text,
                sender,
                time: moment().format("LT"),
            });
        });

        //-- scroll to bottom
        setTimeout(() => $(".chat-history").scrollTop(9999), 10);

        if(sender !== 0) {
            $scope.received_messages++;
        } else {
            $scope.sent_messages++;
        }
    };
});