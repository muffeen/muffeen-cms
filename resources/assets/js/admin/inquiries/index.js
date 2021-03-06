let empty_table_row = '';

function generateRow(row_data) {
    let html = `
        <tr>
            <td>${row_data.name}</td>
            <td>${row_data.email}</td>
            <td>${row_data.subject}</td>
            <td>${timestamp(row_data.created_at)}</td>
            <td> 
                <button type="button" class="btn btn-default btn-xs" data-action="Edit"
                    data-toggle="modal" data-target="#modal-inquiry" data-name="${row_data.name}" 
                    data-email="${row_data.email}" data-subject="${row_data.subject}"
                    data-message="${row_data.message}" data-date="${date(row_data.created_at)}">
                    Edit
                </button>
                <button type="button" class="btn btn-default btn-xs" data-action="Delete"
                    data-toggle="modal" data-target="#modal-delete" data-id="${row_data.id}">Delete
                </button>
            </td>
        </tr>
    `;

    return html;
}

function generatePagination(count, limit) {
    let pagination = $('#pagination');
    if (pagination.data('count') !== count) {
        pagination.pagination({
            prevText: '<<',
            nextText: '>>',
            items: count,
            itemsOnPage: limit,
            onPageClick: (pageNumber) => {
                pagination.hide();
                refreshTable(pageNumber, limit);
                return false;
            }
        });
        pagination.data('count', count);
    } else {
        pagination.show();
    }
    pagination.find('ul').addClass('pagination');
}

function refreshTable(page, limit) {
    $('.overlay').show();
    $.get( `${server_url}/admin/inquiries?page=${page}&limit=${limit}`, (data) => {
        let html = '';
        if (data.list.length === 0) {
            html = empty_table_row;
        } else {
            data.list.forEach((val) => {
                html += generateRow(val);
            });
            html = $(html);
        }
        $('#table-body').empty().append(html);
        generatePagination(data.count, limit);
        $('.overlay').hide();
        $('.copy-link').click(function() {
            copyToClipboard($(this).data('url'));
        });
    })
        .fail((response) => {
            redirectUnauthorized(response);
            showErrorToast();
        });
}

$(document).ready(() => {
    $('#modal-inquiry').on('show.bs.modal', (event) => {
        let button = $(event.relatedTarget);
        $('#name').html(button.data('name'));
        $('#email').html(button.data('email'));
        $('#subject').html(button.data('subject'));
        $('#message').html(button.data('message'));
        $('#date').html(button.data('date'));
    }).on('hide.bs.modal', () => {
        $('#name').html('');
        $('#email').html('');
        $('#subject').html('');
        $('#message').html('');
        $('#date').html('');
    });
    $('#modal-delete').on('show.bs.modal', (event) => {
        let button = $(event.relatedTarget);
        let id = button.data('id');
        let name = button.data('name');
        $('#modal-delete-submit').click(() => {
            $('#modal-delete-submit').empty()
                .append($('<i class="fa fa-spin fa-fw fa-spinner"></i>'));
            let data  = `_token=${$('#user-token').val()}&_method=DELETE`;
            $.post( `${server_url}/admin/inquiries/${id}`, data)
                .done(() => {
                    refreshTable(1, 10);
                    $('#modal-delete').modal('hide');
                    toastSuccess('Message deleted successfully');
                })
                .fail((response) => {
                    redirectUnauthorized(response);
                    showErrorToast();
                    $('#modal-delete').modal('hide');
                });
        })
    }).on('hide.bs.modal', () => {
        $('#modal-delete-submit').empty()
            .append("Ok")
            .unbind('click');
    });

    empty_table_row = $('.empty-table-row');

    refreshTable(1, 10);
});