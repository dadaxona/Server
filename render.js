// render.js
async function getData() {
    const respon = await window.api.get()
    if (respon && respon.statusCode === 200) {
        let rows = ''
        respon.items.forEach(e => {
            rows += `
                <tr>
                    <td>${e.path}</td>
                    <td>${e.command}</td>
                    <td style="${e.status ? "color: green" : "color: red"}">${e.status ? "Online" : "Offline"}</td>
                    <td>
                        <button class="btn btn-start" data-id="${e.id}" data-path="${e.path}" data-command="${e.command}">Start</button>
                        <button class="btn btn-stop" data-id="${e.id}" data-path="${e.path}" data-command="${e.command}">Stop</button>
                    </td>
                    <td>
                        ${
                            e.status ? 
                            `<button class="btn btn-edit2">Edit</button>
                            <button class="btn btn-delete2">Delete</button>` :
                            `<button class="btn btn-edit" data-id="${e.id}" data-path="${e.path}" data-command="${e.command}">Edit</button>
                            <button class="btn btn-delete" data-id="${e.id}">Delete</button>`
                        }
                    </td>
                </tr>
            `
        });
        $('#serverTable').html(rows)
    } else {
        console.log(respon);
    }
}

$(document).on('click', '.btn-start', async function () {
    const id = $(this).data('id')
    const path = $(this).data('path')
    const command = $(this).data('command')
    const respons = await window.api.start({ id, path, command })
    if (respons && respons.statusCode === 200) {
        console.log(respons);
        await getData()
    } else {
        await getData()
        console.log(respons);
    }
})

$(document).on('click', '.btn-stop', async function () {
    const id = $(this).data('id')
    const path = $(this).data('path')
    const command = $(this).data('command')
    const respons = await window.api.stop({ id, path, command })
    if (respons && respons.statusCode === 200) {
        console.log(respons);
        await getData()
    } else {
        await getData()
        console.log(respons);
    }
})

$(document).on('click', '#addBtn', async function () {
    const id = $('#id').val()
    const path = $('#path').val()
    const command = $('#command').val()
    if (path && command) {
        $('.errmsg').text('')
        const respons = id ? await window.api.update({
            id, path, command
        }) : await window.api.create({
            path, command
        })
        if (respons && respons.statusCode === 200) {
            $('#id').val('')
            $('#path').val('')
            $('#command').val('')
            await getData()
        } else {
            console.log(respons);
        }
    } else {
        $('.errmsg').text('No path or command')
    }
})

$(document).on('click', '.btn-edit', async function () {
    $('#id').val($(this).data('id'))
    $('#path').val($(this).data('path'))
    $('#command').val($(this).data('command'))
})

$(document).on('click', '.btn-delete', async function () {
    const id = $(this).data('id')
    const respons = await window.api.destroy({id})
    if (respons && respons.statusCode === 200) {
        await getData()
    } else {
        console.log(respons);
    }
})

getData()