/**
 * JS used for accounts payable module
 */
// Added by Jean-Luc for Ajax
jQuery.ajaxSetup({                             //Send as js format
    'beforeSend': function(xhr) {
        xhr.setRequestHeader("Accept", "text/javascript")
    }
})

jQuery.fn.submitWithAjax = function() {        //Ajaxify button
    this.submit(function() {
        $.post(this.action, $(this).serialize(), null, "script");
        return false;
    })
    return this;
};

(function($) {
    $(document).ready(function() {
        //Added by Jean-Luc for payees/bills
        $("#add-split-button").submitWithAjax();
        // Stripe rows
        $("expense_row:nth-child(even)").addClass("striped")
        init_date_picker();
        init_payment_options();//Bill payment options UI << RyanB
    });
    function init_date_picker() {
        var options = {
            showOn: 'focus',
            showAnim: 'fadeIn'
        },  //fields to be handled with date picker jquery plugin
            dateFields = [
                '#bill_bill_date',
                '#bill_due_date',
                '#bill_payment_terms',
                '#paid_check_date',
                '#paid_owner_date',
                '#paid_cc_date'
            ];
        $(dateFields).each(function() {
            var self = this.toString();
            if ($(self).length)
                $(self).datepicker(options); //bind date picker to element if exists
        })
    }

    function init_payment_options() {
        if (!$('input.payment-method-outer-btn').length)return;//Exit function
        $('input[type=radio]').each(function() {
            this.checked = false;
        }); //to be sure and to fix in FireFox
        var master = $('#payment-method-master').html(); //copy UI html
        var o = {
            payments    : '.payment-method-btn input:radio', //payment option radio buttons
            category    : '.payment-method-outer-btn', //"Make a new payment" or "already made payment" option
            mark        : 'payment-method-active', //mark => marked active with this class
            exp         : '#payment_method_exp', //payment option exp/form div id
            spd         : 200 //slide up/down speed
        },
            f = {
                deselect  : function() {
                    $(o.payments).each(function() {
                        if (this.checked == false) //remove marked class from all buttons not checked
                            $(this).parent().removeClass(o.mark);
                    });
                    return f;
                },
                isActive : function() {
                    var flag = false; //find active buttons
                    $(o.payments, this).each(function() {
                        if ($(this).parent().hasClass(o.mark)) {
                            f.store.call(this);
                            flag = true;
                        }
                    });
                    return flag;
                },
                showForms : function() {
                    $(o.exp).show('fast', function() {
                        $('div.payment-method-exp-box').hide(); //hide all
                        $(this).find('div.payment-method-exp-box[rel=' + o.form_id + ']').slideDown(); //show target form
                        $('#option_name').html(o.header + '<span id="cancel_link" title="Cancel">cancel</span>'); //set title of box
                        f.startOver();
                    });
                },
                startOver : function() {
                    $('#cancel_link')
                        .bind('click', function() {
                            $('#payment-method-master').html('').append(master); //replace html with master copy
                            init_payment_options(); //call self
                        });
                },
                store     : function() {
                    o.form_id = $(this).attr('id'); //id matches rel of payment option exp/div
                    o.header = $(this).attr('title'); //title used as box title
                    return f;
                }
            };
        $(o.category)
            .bind('click', function() {
                var wrap = $(this).parent('.payment-method-wrap'), subWrap = '.payment-method-sub-wrap';
                wrap.siblings().find(subWrap).slideUp(o.spd); //hide other sub wrap options
                $(subWrap, wrap).slideDown(o.spd, function() {
                    f.isActive.call(this) ? f.showForms() : $(o.exp).hide(); //show forms, else no buttons selected... close exp/forms
                });
            });
        $(o.payments)
            .bind('click', function() {
                $(this).parent().addClass(o.mark); //mark parent div as active
                f.store.call(this).deselect().showForms(); //store attributes, deselect other buttons, show exp/form
            });
    }
})(jQuery);