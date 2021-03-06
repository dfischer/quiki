$(function() {
  $('ul#notices li').each(function(i) {
    $.jGrowl($(this).html());
  });
  
  $("select#page_parser").change(function() {
    $.getJSON('/parsers/' + $(this).val(), function(json) {
      $("#parser_reference .reference").html(json.html);
      $("#parser_reference h3").html(json.parser);
    });
  });

  initialize_page_menu();
  
  autoSavePage();

});

function autoSavePage() {
  var form_options = { 
      success:       growlResponse  // post-submit callback 
  };
  
  setInterval(function(){
   $(".edit_page").ajaxSubmit(form_options);
   return false; 
  }, 60000);  
}

// post-submit callback 
function growlResponse(responseText, statusText)  { 
  $.jGrowl('Automatically saved.');
}

function initialize_page_menu() {
  pages = $('#page_menu ul.pages li.page');
  pages.draggable({
    handle      : 'span.handle',
    opacity     : '.8',
    revert      : true,
    zIndex      : 100,
    start       : function() {},
    drag        : function() {},
    stop        : function() {}
  });
  

  sections = $("#page_menu ul.sections li.section");
  $('a.section', sections).droppable({
    accept      : '#page_menu ul.pages li.page',
    hoverClass  : 'hover',
    drop        : function(e, ui) {
      form = $('form', ui.draggable);
      $("input[@name='page[section_id]']", form).val(this.id);
      form.get(0).submit();
    }
  });
  
  // custom accordion functionality because the jQuery one was a bit quirky w/
  // the linking and drag/drop
  $("ul.pages", sections).hide();
  $("ul.pages.current", sections).show();
  $("a.section", sections).click(function() {
    $('#page_menu ul.sections li.section ul.pages').hide();
    $('ul.pages', $(this).parents('li.section')).show();
    return false;
  })
  sections.hover(function() {
    $('a.edit, a.destroy', this).show();
  }, function() {
    $('a.edit, a.destroy', this).hide();
  });
  $("a.edit", sections).click(function() {
    section = $(this).parents('li.section');
    $('form.edit_section', section).toggle();
    $('a.section', section).toggle();
    return false;
  });

  // page path search autocompleter
  pages = new Array();
  $('#page_menu li.page a').each(function(i) {
    pages[i] = $(this).html().replace(/^(.*?)<.*$/, "$1") + '|' + this.href.replace(/^.*:\/\/.*?\/(.+)$/, "$1");
  });
  
  $("#page_menu #page_search").autocomplete(pages, {
    formatItem : function(row, index, total, q) { return row[0].replace(/^(.*)\|.*$/, "$1"); }
  }).result(function(e, data, formatted) {
    location.href = '/' + data[0].replace(/^.*?\|(.*)$/, "$1");
  });
};

// tacks the given format onto the given URL, i.e.
//   formatify('http://www.example.com/pages?page=mypage', 'json') => 'http://www.example.com/pages.json?page=mypage'
function formatify(url, format) {
  return url.replace(/^([^\?#]*)(.*)$/, "$1." + format + "$2");
}

// tacks .tab onto the the given URL
function tabify(url) {
  return formatify(url, 'tab');
}

// tacks .tab onto the hrefs of the given jQUery objects
jQuery.fn.tabify = function() {
  this.each(function() { this.href = tabify(this.href); });
  return this;
}
