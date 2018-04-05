angular.module('Chat', [])
    .controller('ChatController', function($scope) {
        const socket    = io("https://myfbtool.com:3000");


        $scope.active_user = {
            first_name  : "...",
            profile_pic : "https://steembottracker.com/img/bot_logo.png",
        };
        $scope.received_messages    = 0;
        $scope.sent_messages        = 0;
        let sender      = "";
        let recipient   = "";



        socket.on("receiver", (data) => {
            console.log("data", data);

            sender      = data.page;
            recipient   = data.sender;

            var templateResponse = Handlebars.compile( $("#message-response-template").html());
            chat.$chatHistoryList.append(templateResponse({
                response: data.text,
                time: chat.getCurrentTime(),
                count: 2,
            }));
            chat.scrollToBottom();

            $scope.received_messages++;

            if($scope.active_user.id !== data.sender && data.sender !== "") {
                $.ajax({
                    url: `https://graph.facebook.com/v2.6/${recipient}?fields=first_name,last_name,profile_pic&access_token=EAAClceU7X3IBAEMTVjQy7plqRcqZCYofp2P10QppftVjPZBkV6eJ6YTgJIM3fF4phZCWcHhngOyWQnOt03gIxnyh7LZBD9qfJJG3oesJSxfqCGVoNRPNe51ZCbFYeWc61TwwuQuxkpuceVnWnQ9XJEI0kZCd6v5Wndi7Be0lnECZBx49owOcROh`,
                    success: (user_received) => {
                        console.log("user", user_received);
                        $scope.$apply(function () {
                            $scope.active_user    = user_received;
                        });
                    }
                })
            }
        });

        var chat = {
            messageToSend: '',
            init: function() {
                this.cacheDOM();
                this.bindEvents();
                this.render();
            },
            cacheDOM: function() {
                this.$chatHistory = $('.chat-history');
                this.$button = $('button');
                this.$textarea = $('#message-to-send');
                this.$chatHistoryList =  this.$chatHistory.find('ul');
            },
            bindEvents: function() {
                this.$button.on('click', this.addMessage.bind(this));
                this.$textarea.on('keyup', this.addMessageEnter.bind(this));
            },
            render: function() {
                this.scrollToBottom();
                if (this.messageToSend.trim() !== '') {
                    var template = Handlebars.compile( $("#message-template").html());
                    var context = {
                        messageOutput: this.messageToSend,
                        time: this.getCurrentTime(),
                        count: 1,
                    };

                    this.$chatHistoryList.append(template(context));
                    this.scrollToBottom();
                    this.$textarea.val('');
                    socket.emit("sender", { text: this.messageToSend, sender, recipient })

                    // TODO: remove this apply after full migration
                    $scope.$apply(function () {
                        $scope.sent_messages++;
                    })
                }

            },

            addMessage: function() {
                this.messageToSend = this.$textarea.val();
                this.render();
            },
            addMessageEnter: function(event) {
                // enter was pressed
                if (event.keyCode === 13) {
                    this.addMessage();
                }
            },
            scrollToBottom: function() {
                this.$chatHistory.scrollTop(this.$chatHistory[0].scrollHeight);
            },
            getCurrentTime: function() {
                return new Date().toLocaleTimeString().
                replace(/([\d]+:[\d]{2})(:[\d]{2})(.*)/, "$1$3");
            },

        };

        chat.init();

        var searchFilter = {
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


(function(){

  
})();