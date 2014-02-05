/**
 * @file
 * Injects WagnerGUIDE links.
 * 
 * Inject a WagnerGUIDE link on each line with holding information from ALMA on the ting object being viewed.
 */

// Container object for all our availability stuff.
Drupal.dingWagnerguide = {};

(function($){
  Drupal.behaviors.dingWagnerguide = {
    attach: function(context, settings) {
      // Check if there is a container for ting-availability.
      if ($(".pane-ting-object .holdings").length > 0) {

        // Find item ID.
        if (itemContainer = $('div.holdings').filter(function () {
            return $(this).attr('class').match(/holdings-\d+/);
            }).get(0)) {
          Drupal.dingWagnerguide.itemId = $(itemContainer).attr('class').match(/holdings-(\d+)/)[1];

          // Get WagnerGUIDE links.
          ajax_path = Drupal.settings.basePath;
          $.getJSON(ajax_path + 'ding/wagnerguide/item/' + Drupal.dingWagnerguide.itemId, {}, function(data) {
            Drupal.dingWagnerguide.data = data;

            // ...wait for the ting-availability module to write the holdings in the container.
            var waitForContentTimer = window.setInterval(function() {
              if ($('.availability-holdings-table tbody tr').length) {
                clearInterval(waitForContentTimer);
                Drupal.dingWagnerguide.populate();
              }
            }, 1000);
          });
        }
      }

    }
  }
})(jQuery);


Drupal.dingWagnerguide.populate = function() {
  var wagnerLinks = Drupal.dingWagnerguide.data[Drupal.dingWagnerguide.itemId];

  // Run through the printed holdings and insert links/popups.
  //   Hope that the lines are in the same order as our links as we have no id on the individual lines.
  (function($){

    // Get the holding elements to populate with links, making sure they are only inserted once
    var wglinks = $('.availability-holdings-table tbody tr').once('wagnerguide-links');

    wglinks.each(function(index){
      if (wagnerLinks[index]) {

        if (wagnerLinks[index].popup) {
          var link = $(this).find('td:first').prepend(' <a class="wagnerguide popup" title="Click the button for more information"><span>Find</span></a> ');
          var $dialog = $('<div></div>').html(wagnerLinks[index].popup).dialog({
            autoOpen: false,
            title: ''
          });
          link.click(function() {
            $dialog.dialog('open');
            return false;
          });

        } else if (wagnerLinks[index].href) {
          $(this).find('td:first').prepend('<a class="wagnerguide map" href="' + wagnerLinks[index].href + '" target="_blank" title="Click and see on a map where the material is located in the library"><span>Find</span></a> ');
        }

        if (wagnerLinks[index].debug) {
          $(this).find('td:first').append('<!-- ' + wagnerLinks[index].debug + ' -->');
        }
      }
    });

  })(jQuery);

}

