/*!
 * Sharepoint Calendar Feeder
 * http://www.josebrowne.com
 *
 * Version: 0.7
 * Created: 6/20/2012
 * Last Updated: 9/7/2012
 * Written By: JoseBrowne.com
 * Initially written For: FSU Center for Global Engagement
 */
(function($){
    function salt() {
          var now = new Date();
          var saltDate = new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), now.getUTCMilliseconds());
          return saltDate.getTime();
    }
    var source = {

      init: function(o){

        //Preloader
        $('div#calendar').prepend('<div id="loading"></div>');

        /*-----------------   Configuration   ------------------------*/

        var filter_by   = o.filter_by;
        var filter_by_2 = o.filter_by_2; 
        var count       = o.count;
        var feed_url    = o.feed_url;
        var link_url    = o.link_url
        var display_all = o.display_all; //Set to 'true' to display all calendar entries without filters
        console.log(link_url);

        /*----------------- end Configuration  ------------------------*/

        /*----------------- No need to edit below this line  ------------------------*/

        //Months to be used
        var month_names = new Array ( );
        month_names[month_names.length] = "Jan";
        month_names[month_names.length] = "Feb";
        month_names[month_names.length] = "Mar";
        month_names[month_names.length] = "Apr";
        month_names[month_names.length] = "May";
        month_names[month_names.length] = "Jun";
        month_names[month_names.length] = "Jul";
        month_names[month_names.length] = "Aug";
        month_names[month_names.length] = "Sep";
        month_names[month_names.length] = "Oct";
        month_names[month_names.length] = "Nov";
        month_names[month_names.length] = "Dec";

        //days of the week
        var day_of_week = new Array ( );
        day_of_week['1'] = "Monday";
        day_of_week['2'] = "Tuesday";
        day_of_week['3'] = "Wednesday";
        day_of_week['4'] = "Thursday";
        day_of_week['5'] = "Friday";
        day_of_week['6'] = "Saturday";
        day_of_week['7'] = "Sunday";

        //Fix timezone issue
        Date.prototype.addHours= function(h){
            this.setHours(this.getHours()+h);
            return this;
        }

        //function to format time
        function formatTime(date) {
            var d  = new Date(date).addHours(-4);
            var hh = d.getUTCHours();
            var m  = d.getMinutes();
            var dd = "am";
            var h  = hh;

            //Day of the week
            var day = day_of_week[d.getDay(date)];

            //hours to am pm
            if(hh > 12){
                hh = hh-12;
                dd = "pm"
            } 

            //minutes
            m = m<10?"0"+m:m;

            return(day + ' at ' + hh + ':' + m + dd );
        }

        new Date(0).toString()
        //function to convert plain text to links
        function replaceURLWithHTMLLinks(text) {
            var exp = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
            return text.replace(exp,"<a href='$1'>$1</a>"); 
        }

        //Load the feed
          google.load("feeds", "1");
          
        //For espacing html characters
          // String.prototype.unescapeHtml = function () {
          //   var temp       = document.createElement("div");
          //   temp.innerHTML = this;
          //   var result     = temp.childNodes[0].nodeValue;
          //   temp.removeChild(temp.firstChild);
          //   return result;}

        // Our callback function, for when a feed is loaded.
        function feedLoaded(result) {
          
          if (!result.error) {

            // Grab the container we will put the results into
            var content = document.getElementById("calendar");
            var html    = '';
            
            // Get current height of container div then set it manually (for animation later)
            var containerHeight = $(content).outerHeight();
            $(content).css({height: containerHeight});

            //Function that removes date from begining of title string
            function removeDateTitle(strValue){
                var string = strValue.substr(16);
                var string = $.trim(string);
                return string;
            };

            function removeDateDesc(strValue){
                var string = strValue.substr(25);
                var string = $.trim(string);
                return string;
            };
            
            // Check out the result object for a list of properties returned in each entry.
            // http://code.google.com/apis/ajaxfeeds/documentation/reference.html#JSON
            for (var i = 0; i < result.feed.entries.length; i++) {
              var entry           = result.feed.entries[i];
              
              //RegEx queries for 'match' method
              var filter_by_REG   = RegExp(filter_by, 'i');
              var filter_by_2_REG = RegExp(filter_by_2, 'i');
              
              var cond1           = result.feed.entries[i].title.match(filter_by_REG);
              var cond2           = result.feed.entries[i].title.match(filter_by_2_REG);
              
              //Display All items
              if(display_all == true){
                cond1 = true; cond2 = true;
              }

              //Query entries for matches and add them to "entry" array for display      
              if(cond1 || cond2 ){

                var pubDate     = new Date(entry.publishedDate);
                var pubMonth    = month_names[pubDate.getMonth()];
                var pubdateNum  = pubDate.getDate();
                var href        = 'http://calendar.fsu.edu/Lists/Center%20for%20Global%20Engagement/calendar.aspx';//entry.link;
                var title       = removeDateTitle(entry.title);
                var location    = entry.categories[0];
                    if(location != undefined){
                        location    = location.replace(/[+]/g ," ");
                    }
                    
                var time        = formatTime( entry.publishedDate );
                var desc = entry.content; 
                    desc = removeDateDesc(desc);
                    desc_short = desc.split(" ").splice(0, 25).join(" ");
                    desc_short += "...";

                
                var fb_url ='<iframe src="http://www.facebook.com/plugins/like.php?href=http://www.facebook.com/fsucge&action=recommend" scrolling="no" frameborder="0" class="fb_like_btn"></iframe>';
                
                // Output
                html += '<div class="calentry' + ' tooltip_' + i + '">' + '<div class="calcon">' + '<div class="caltop">' + pubMonth + '</div>' + '<div class="calbottom">' + 
                pubdateNum + '</div>' + '</div>' + '<div class="description"><h3 class="calhead"><a href="' + href + '" target="_blank">' + title + '</a></h3>' + 
                '<div class=callocation>' + time + ' in ' + location + '</div>' + '<p>' + desc_short + '<br />' + 
                '</p></div><div class="clear"></div>' + '</div>';

                //QtipContent
                html += '<div style="display: none;">' + 
                '<b>Full Description:</b><br />' + replaceURLWithHTMLLinks(desc) + '<br />' +
                '<p><b>Time: </b>' + time + '<br />' +
                '<b>Location: </b>' + location +
                '</p>' + fb_url +'</div>';
                //throw new Error(html);
                //update content
                content.innerHTML = html;

                

              }

            }//end loop

            //Display message when no feed items found
            if(html == ''){
              html += '<p class="fsucal_noEvents">No events currently scheduled.</p>';
              content.innerHTML = html;
            }

            //Hide PreLoader
            $('#loading').fadeOut('slow');

            //Animate loaded content
            $(content).wrapInner('<div class="calendarInner" />'); //wrap with inner div
            var contentHeight = $('.calendarInner').outerHeight();// Get the height of the content div.
            contentHeight = contentHeight;
            $(content).animate({height:contentHeight}, 1000); // Animate the height 
            $('.calendarInner').css('width','100%'); //Fix border line issue after animation

            //Qtip

            var cal_items 
            $('.calentry').each(function() {
                var thisEntry = $(this);

                thisEntry.qtip(
                {
                    content: {
                        text: thisEntry.next('div:hidden'),
                        title: {
                            text: thisEntry.find('h3').text(),
                            button: true
                        }
                    },
                    position: {
                        my: 'center', // ...at the center of the viewport
                        at: 'center',
                        target: $(window)
                    },
                    show: {
                        event: 'click', // Show it on click...
                        solo: true, // ...and hide all other tooltips...
                        modal: true // ...and make it modal
                    },
                    hide: false,
                    style: {
                        classes: 'ui-tooltip-light ui-tooltip-rounded',
                        width: 500
                    }
                });   
            }).bind('click', function(event){ event.preventDefault(); return false; }); 
            //end qtip 

            
          }

        }
        function OnLoad() {
          // Create a feed instance that will grab the feed.
          var feed = new google.feeds.Feed(feed_url);
          feed.setNumEntries(count);

          // Calling load sends the request off.  It requires a callback function.
          feed.load(feedLoaded);
         
        }

        google.setOnLoadCallback(OnLoad);


      } //end init

    };
 
    $.fn.extend({ 
         
        //pass the options variable to the function
        fsucalendar: function(options) {
 
 
            //Set the default values, use comma to separate the settings, example:
            var defaults = {
                filter_by   : false,
                filter_by_2 : false,
                count       : 4,
                display_all : false,
                feed_url    : 'noFeed',
                link_url    : 'http://calendar.fsu.edu/Lists/Center%20for%20Global%20Engagement/calendar.aspx'
                //link_url    : 'http://calendar.fsu.edu/_layouts/listfeed.aspx?List=%7B4BCA91EA-72AE-4D23-9D11-8D44FB5AAED2%7D&Source=http%3A%2F%2Fcalendar%2Efsu%2Eedu%2FLists%2FCenter%2520for%2520Global%2520Engagement%2Fcalendar%2Easpx' + '&salt='+salt()
            }
                 
            var options =  $.extend(defaults, options);
            
                var o = options;
                
                //Call the init method (get the ball rollin) -- passing options 'o'
                    source.init(o);
        }
    });
     
})(jQuery);
