$(function(){
    function record(msg){
        $.ajax({
            url: "/record",
            type: "get",
            data: {
                "url": msg || "none"
            },
            error:function(e){
                console.log(e);
            }
        });
    }
    function generateRadomInt(top){
        top = top || 5;
        return parseInt(Math.random()*top, 10);
    }
    function runCanvas() {
        var engine = new RainyDay({image: this});
        engine.rain([ [2, 1, 0.08], [1, 1, 0.1], [3, 3, 0.2]], 0);
        setTimeout(function(){engine.stopRain()}, 30000);  // 30 seconds
        clearTitleLoadingPrompt();
        $("#home-sub-page").fadeIn(300).next().fadeOut(0);
        $("#background, canvas").css({opacity: 1});
    }
    function clearTitleLoadingPrompt(){
        var madLiarTitle = $("#madliar-title");
        if(madLiarTitle.css("opacity")){
            madLiarTitle.css({top: "140px", "opacity": 0});
        }
    }
    function initialization(){
        $('#background').on("load", runCanvas).attr("src", "/static/img/" + generateRadomInt() + ".jpg");
    }
    function renderHomePage(){
        var homePageArticleBoxHtml = "";
        for (var i = 0; i < 10; i ++){
            var article = window.articleList[window.articleIdList[i]];
            var articleBox = [
                '<div class="blog-box-container animated fadeInDownSlow">',
                    '<div class="blog-timeline-box">',
                        '<div class="blog-timeline-wrapper">',
                            '<div class="blog-timeline-spin">',
                                '<img src="/static/img/hex.png">',
                            '</div>',
                            '<div class="blog-timeline-time">' + article.create_time + '</div>',
                        '</div>',
                    '</div>',
                    '<div class="blog-concise-box">',
                        '<div class="blog-concise">',
                            '<div class="blog-concise-title">',
                                '<a data-id="' + article.id + '">' + article.title + '</a>',
                            '</div>',
                            '<div class="blog-concise-preimg">',
                                '<img src="' + article.first_figure + '">',
                            '</div>',
                            '<div class="blog-concise-content">' + marked(article.preview) + '</div>',
                            '<a class="read-more" data-id="' + article.id + '">继续阅读 >></a>',
                        '</div>',
                    '</div>',
                '</div>'
            ];
            homePageArticleBoxHtml += articleBox.join("");
        }
        $("#home-sub-page").html(homePageArticleBoxHtml);
        $(".blog-concise-title a, .read-more").click(function(){
            articleReadingView($(this).data("id"));
        })
    }
    function articleReadingView(article_id){
        record("article_" + article_id);
        var article = window.articleList[article_id],
            article_index = window.articleIdList.indexOf(article_id),
            next = "",
            prev = "";

        if(article_index > 0){
            var next_id = window.articleIdList[article_index - 1];
            var next_title = window.articleList[next_id].title;
            next = ""
                + '<div class="article-nav-next">'
                + '下一篇：<a class="next-article-btn" data-id="' + next_id + '">' + next_title + '</a>'
                + '</div>';
        }
        if(article_index < window.articleIdList.length - 1){
            var prev_id = window.articleIdList[article_index + 1];
            var prev_title = window.articleList[prev_id].title;
            prev = ""
                + '<div class="article-nav-prev">'
                + '上一篇：<a class="prev-article-btn" data-id="' + prev_id + '">' + prev_title + '</a>'
                + '</div>';
        }

        var detailHtml = [
            '<div class="detail-container animated fadeInDownSlow">',
                '<div class="detail-paper">',
                    '<div class="detail-header">',
                        '<div class="detail-article-close"><i class="fa fa-times" aria-hidden="true"></i></div>',
                        '<div class="detail-article-return"><i class="fa fa-arrow-left" aria-hidden="true"></i></div>',
                        '<div class="detail-article-title">' + article.title + '</div>',
                    '</div>',
                    '<div class="detail-content">' + marked(article.content) + '</div>',
                    '<div class="detail-footer">版权所有，请勿侵权。作者：' + (article.author || "CL") + '，最后更新于' + article.create_time + '</div>',
                    prev + next,
                    '<div class="m-comment">',
                        '想要添加评论？',
                        '<a href="mailto:i@caoliang.net?subject=评论《'+ article.title +'》">点击此处</a>给作者发送邮件',
                    '</div>',
                '</div>',
            '</div>'
        ];
        $("section").children().fadeOut(0);
        $("#detail-sub-page").html(detailHtml.join("")).fadeIn(300);
        document.body.scrollTop = 0;
        $(".detail-article-return, .detail-article-close").click(function(){
            $("section").children().fadeOut(200);
            $("#home-sub-page").fadeIn(0);
        });
        $(".next-article-btn, .prev-article-btn").click(function(){
            articleReadingView($(this).data("id"));})
    }
    function onBackToHome(){
        if (window.history && window.history.pushState) {
            $(window).on('popstate', function () {
                window.history.pushState('forward', null, '#');
                window.history.forward(1);
                return $("#detail-sub-page:visible").length > 0
                    ? showHomePage()
                    : null;
            });
        }
        window.history.pushState('forward', null, '#');
        window.history.forward(1);
    }
    function showHomePage(){
        $("section").children().fadeOut(0);
        $("#home-sub-page").fadeIn(0);
    }
    function renderArticleListPage(){
        $("<botton>", {
            class: "tag-btn tag-btn-all",
            html: "全部 " + articleIdList.length
        }).appendTo("#article-list-tag");
        for(var i = 0; i < articleIdList.length; i++){
            var article = articleList[articleIdList[i]];
            var tags = article.tags;
            if(tags != undefined){
                for(var j = 0; j < tags.length; j++){
                    var tag = tags[j],
                        existTagBtn = $(".tag-btn[data-tag='" + tag + "']");
                    if(existTagBtn.length == 0){
                        $("<botton>", {
                            class: "tag-btn",
                            "data-tag": tag,
                            "data-len": 1,
                            html: tag + " 1"
                        }).appendTo("#article-list-tag");
                    }else{
                        var existTagLen = existTagBtn.data("len") + 1;
                        existTagBtn.data("len", existTagLen).html(tag + " " + existTagLen);
                    }
                }
            }

            /* load article */
            $("<div>", {
                class: "list-post clearfix",
                "data-tag": (article.tags || []).join(" "),
                "category": article.category,
                html: [
                    '<h4 style="margin-bottom:0px">',
                        '<a class="list-post-a" data-id="' + article.id + '">' + article.title + '</a>',
                    '</h4>',
                    '<div class="al_meta"><footer>',
                        '<span class="categories">' + article.category + '</span>',
                        ' @<time class="date">' + article.create_time + '</time>',
                    '</footer></div>'
                ].join("")
            }).appendTo("#article-list");
        }
        /* bind event */
        $(".tag-btn").click(function(){
            if($(this).hasClass("tag-btn-all")){
                $(".list-post").fadeIn(200);
            }else{
                var articleTitleList = $(".list-post").fadeOut(0),
                    selTag = $(this).data("tag");
                for(var i = 0; i < articleTitleList.length; i++){
                    if(articleTitleList.eq(i).data("tag").indexOf(selTag) > -1){
                        articleTitleList.eq(i).fadeIn(200);
                    }
                }
                $(this).addClass("tag-btn-selected").siblings().removeClass("tag-btn-selected");
            }
        });
        $(".category-desc a").click(function(){
            $(".list-post").fadeOut(0);
            $(".list-post[category=" + $(this)[0].innerText + "]").fadeIn(200);
        });
        $(".list-post-a").click(function(){
            articleReadingView($(this).data("id"));
        });
    }
    $(function(){
        $(".logo").shuffleLetters();
        onBackToHome();
        renderHomePage();
        renderArticleListPage();
        initialization();
        $("#about-view").click(function(){
            record("about");
            clearTitleLoadingPrompt();
            $("section").children().fadeOut(0);
            $("#about-sub-page").fadeIn(400);
            document.body.scrollTop = 0;
        });
        $("#home-view").click(function(){
            showHomePage();
        });
        $("#list-view").click(function(){
            record("list_view");
            $("section").children().fadeOut(0);
            $("#list-view-sub").fadeIn(400);
        });
        $(".navi a").click(function(e) {
            if($(this).hasClass("current")) {
                $(this).removeClass("current");
            }else{
                $(".navi a").removeClass("current");
                $(this).addClass("current");
            }
        });
    });
});