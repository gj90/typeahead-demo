$(function () {

    // Set vars
    var username = ""; 
    var repositories_url = ""; 
    var type_timer;
	// Generate your Personal Access Token on Github for "repo".
	// Code can work without token, but when you reach the API usage limit (around 60 requests) it'll stop working.
    var access_token_github = "";
    
	
    // Activates search on user input
    $('#github-user').on('keydown', function (e) {
        $(".instructional").fadeOut(); // Hide instructional texts
        clearTimeout(type_timer); // Clear timeout in case the user is still typing
        type_timer = setTimeout(function () {
            set_repo_url();
        }, 500);
    });

    // Set Repository URL upon entering username
    function set_repo_url() {
        username = $('#github-user').val();
        if(username != ""){
            repositories_url = "https://api.github.com/users/" + username + "/repos?access_token=" + access_token_github;
            get_repo_data();        
        }else{
            $(".main-wrapper-repo").html("");
			$("<div class='repo-wrapper'>").append("<h4>Please enter a username.</h4>").appendTo('.main-wrapper-repo');
        }
        
    };

	// Fetches repo data and fills the repo list with results
    function get_repo_data() {
        $(".main-wrapper-repo").html("");
        $.ajax({
            url: repositories_url,
            success: function (data) {
				if(data.length == 0){
					// If user has no (public) repos, empty array is returned
					$("<div class='repo-wrapper'>").append("<h4>No (public) repos found for this user.</h4>").appendTo('.main-wrapper-repo');
				}else{
				$.each(data, function (i, item) {
                    var contributors_url = "";
					var repo_name = "";
                    contributors_url = data[i].contributors_url + "?access_token=" + access_token_github;
                    repo_name = data[i].full_name;
                    
                    $("<div class='repo-wrapper'>").append("<a href='#' class='repo' repo-url='"+data[i].contributors_url+"' repo-name='"+repo_name+"'>"+repo_name+"</a>").appendTo('.main-wrapper-repo');
                });	
				}
                
            }, error: function (e) {
                //Repo not found / User not found
                $("<div class='repo-wrapper'>").append("<h4>No such user found.</h4>").appendTo('.main-wrapper-repo');
            }
        });
    };
    
    /* Chart setup - START  */

    // Chart size and type
    var options = {
        width: '100%',
        height: '500px',
        distributeSeries: true,
        axisX: {
            offset: 80
        },
        axisY: {
            offset: 30,
            onlyInteger: true
        }
    };

    // Initialize chart (without any data, so it can be updated later when data comes in)
    chart = new Chartist.Bar('.ct-chart', {}, options);

    /* Chart setup - END  */

    // Retrieves contributors and number of contributions for a given repo and then updates the chart
    function pullRepoData(repo_url, repo_name) {

        $.get(repo_url+"?access_token="+access_token_github, function (data) {
            var contributors = [];
            var contributions = [];
            $.each(data, function (i, item) {
                // Add only contributors with at least 1 contribution to the repo - optional condition
                if (data[i].contributions > 0) {
                    contributors.push(data[i].login);
                    contributions.push(data[i].contributions);
                    // Update chart
                    updateChart(contributors, contributions);
                }
            });
        });

        // Decorative transition
        $('.ct-chart, .github-repo').fadeOut(function () {
            $(".github-repo").html(repo_name); // Adds a display of repo name
            $('.ct-chart, .github-repo').fadeIn();
        });

    };

    // Updates chart with data arrays (labels/series)
    function updateChart(contributors, contributions) {
        chart.update({
            labels: contributors,
            series: contributions
        });
    }

    // Opens chart for the selected repo
    $(document).on("click", ".repo", function() {
        // Decorative selection - selected repo
        $(this).parent().addClass('active').siblings().removeClass('active');

        // Pull repo data and generate chart
        pullRepoData($(this).attr('repo-url'), $(this).attr('repo-name'));
    });

});