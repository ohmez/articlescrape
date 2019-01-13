
$(document).on("click", "#addComment",function(event) {
    var id = $(this).attr('data-id');

        $("#comment-section-"+id).html(
            ('<form method="POST" action="/comment/'+id+'">'
            +'<div class="row gtr-uniform"> <div class="col-10 col-12-xsmall">'
            +'<input type="text" name="title" id="title" value="" placeholder="comment title" /></div>'
            +'<div class="col-12 col-12-small"><input type="text" name="body" id="body" value="" placeholder="comment" />'
            +'</div><div class="col-12"><ul class="actions" style="display: flex;"><li><input type="submit" value="Post" class="primary" /></li>'
            +'<li><input type="reset" value="Reset" /></li></ul></div></div></form>'
            )
        )

   
});

$(document).on("click", "#deleteComment",function(event) {
    var id = $(this).attr('data-id');
    $.ajax({
        method: "POST",
        url: "/removecomment/" +id,
    }).then(location.reload());

});