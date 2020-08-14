function posSellDialog(form) {
    ga_track('pos', 'posSellDialog');

    var cx = 800; //w
    var cy = 600; //h

    return testDialog('/pos.php?act=sell&ajax=1',cx,cy, reqParams(arguments));

}

function pos_handleCallback(res, main_module) {
    var loadCallbacks = {
        handleCallback: function(res) {
            switch (res.type) {
                case 'autoload': this.autoload(res); break;
                case 'pos': this.pos(res); break;
            }

        },
    
        autoload: function(res) {
            switch (res.act) {
                case 'loadworks': this.autoload_works(res); break;
            }
        },
        

        pos: function(res) {
            switch (res.act) {
                case 'search': this.pos_search(res); break;
            }
        },
            
            
        autoload_works: function(res) {
            if (res.code==200) {

                main_module.process_autoload(res, '#works_table');

            }
        },

        pos_search: function(res) {
            if (res.code==200) {
                if (res.found_count == 0) {
                    window.dpopup.popup('Штрих код не найден', null, null, null, 'red');
                } else
                if (res.found_count == 1) {
                    document.basiscrm_app_obj.addReceiptItem(res.html, res.found_id);
                }

            }
        },
        
 
    }

    loadCallbacks.handleCallback(res);
}

var pos_obj = function(win, doc, elem_root){
    "use strict";
    

    // Constants
    var CLASS_ACTIVE          = '_active';
    var CLASS_TABLET_MODE     = '_tablet_mode';

    var EVENT_CLICK           = 'click';
    var EVENT_KEYDOWN         = 'keydown';

    var PAGE_MAIN             = 'pos_page_main';
    var PAGE_PAYMENT          = 'pos_page_payment';

    // Variables
    var elem_receipts_root = null;
    var elem_receipts_list = null;
    var elem_receipts_btnlist = null;
    var elem_receipt_summary_amount = null;

    var receipts_count = 0;
    var active_receipt = null;

    var payment_form = null;
    
    var form = null;
    var barcode_scanner = null;

    var receipts = [];
    var pages = [];


    var public_interface = {
            addReceiptItem: addReceiptItem
        };

    
    app_init();
    
    function app_init() {

        form = elem_root.querySelector('form._search');
        elem_receipts_root = elem_root.querySelector('.receipt_prod_list');
        elem_receipts_list = elem_receipts_root.querySelector('._list');
        elem_receipts_btnlist = elem_receipts_root.querySelector('._receipts_btnlist');
        elem_receipt_summary_amount = elem_receipts_root.querySelector('._summary ._amount');

        pages = elem_root.querySelectorAll('.pos_page');

        var elem = elem_receipts_root.querySelector('.btn_payment').addEventListener(EVENT_CLICK, paymentClick);

        barcode_scanner = new BarcodeScanner(barcode_scanner_callback);
        
        elem_root.basiscrm_app_obj = public_interface;
        document.basiscrm_app_obj = public_interface;

        initEvents();

        activatePage(PAGE_MAIN);

        createNewReceipt();
        createNewReceipt();
        createNewReceipt();
        activateReceipt(0);



    }

    function initEvents() {
        doc.addEventListener(EVENT_KEYDOWN, _keyDown);
    }

    function _keyDown(e) {
        if (e.keyCode == 27) {
            activatePage(PAGE_MAIN);
        }
    }

    function activateTabletMode() {
        elem_root.classList.add(CLASS_TABLET_MODE);
    }

    
    function barcode_scanner_callback(a) {
        search(a);
    }

    function search(a) {
        //form.item_id.value = "";
        form.q.value = a;
        //form.quantity.value = 0;
        defaultSubmit(form);
    }

    function createNewReceipt() {
        receipts_count++;

        receipts.push({
            name: "new",
            items: 0,
            total: 0.0
        });

        var elem = doc.createElement('div');

        //elem_receipts_list.appendChild(elem);
        elem_receipts_list.insertBefore(elem, null);

        var elem2 = doc.createElement('form');
        elem2.method = "post";
        elem.insertBefore(elem2, null);






        elem = doc.createElement('a');
        elem.href = "#";
        //elem_receipts_btnlist.appendChild(elem);
        elem_receipts_btnlist.insertBefore(elem, null);
        elem.innerHTML = "New";

        elem.addEventListener(EVENT_CLICK, tabClick);

    }

    function activateReceipt(ind) {
        if (active_receipt != null) {
            elem_receipts_btnlist.childNodes[active_receipt].classList.remove(CLASS_ACTIVE);
            elem_receipts_list.childNodes[active_receipt].classList.remove(CLASS_ACTIVE);
        }
        active_receipt = ind;
        elem_receipts_btnlist.childNodes[active_receipt].classList.add(CLASS_ACTIVE);
        elem_receipts_list.childNodes[active_receipt].classList.add(CLASS_ACTIVE);

    }

    function activatePage(page) {
        for (var i = pages.length - 1; i >= 0; i--) {
            if (pages[i].classList.contains(page)) {
                pages[i].classList.add(CLASS_ACTIVE);
            } else {
                pages[i].classList.remove(CLASS_ACTIVE);
            }
        }
    }

    function tabClick(e) {
        e.preventDefault();
        activateReceipt(whichChild(e.target));
    }

    function paymentClick(e) {
        e.preventDefault();
        if (active_receipt == null || !receipts[active_receipt].items) {
            return false;
        }
        payment_form = elem_receipts_list.childNodes[active_receipt].querySelector('form');
        if (payment_form != null) {
            activatePage(PAGE_PAYMENT);
        }
        
    }

    function whichChild(elem){
        var  i= 0;
        while((elem=elem.previousSibling)!=null) ++i;
        return i;
    }


    function addReceiptItem(html, item_id) {
        if (receipts_count == 0) {
            createNewReceipt();
            activateReceipt(0);
        }

        var elem = elem_receipts_list.childNodes[active_receipt].querySelector('form');

        var elem2 = elem.querySelector('.item_id_' + item_id + ' ._quantity input');
        var elem3 = elem.querySelector('.item_id_' + item_id);
        
        if (elem2 == null) {
            receipts[active_receipt].items++;
            elem.insertAdjacentHTML('beforeend', html);
        } else {
            var val = (parseFloat(elem2.value) || 0) + 1;
            elem2.value = val;
            elem3.dataset.quantity = val;
        }

        recalcReceiptTotal();
    }

    function recalcReceiptTotal() {
        var total = 0.0;
        var elem, subtotal;
        var elems = elem_receipts_list.childNodes[active_receipt].querySelectorAll('form .pos_receipt_item');
        for (var i = elems.length - 1; i >= 0; i--) {
            var q = (parseFloat(elems[i].dataset.quantity) || 0);
            subtotal = (parseFloat(elems[i].dataset.price) || 0) * q;
            
            var wtf = (parseFloat(elems[i].dataset.norm) || 0);

            if ((q % wtf) == 0) {
                elems[i].classList.remove('error_norm');
            } else {
                elems[i].classList.add('error_norm');
            }

            elem = elems[i].querySelector('._total');
            elem.innerText = subtotal;
            total += subtotal;
        }
        receipts[active_receipt].total = total;

        elem_receipt_summary_amount.innerText = total;
    }




    function setFoundOneItem(found_id, html) {
        var elem = elem_found_item.querySelector('._item');

        if (found_id != null) {
            form.item_id.value = found_id;
            elem.innerHTML = html;

            elem_found_item.style.display = '';

        } else {
            elem_found_item.style.display = 'none';
            elem.innerHTML = '';

        }
    }

    function setFoundItems(html) {
        setFoundOneItem();
    }

    
};
