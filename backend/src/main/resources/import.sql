insert into usuario (nome, email, perfil) values ('Ana Souza', 'ana@conectaevent.com', 'ORGANIZADOR');
insert into usuario (nome, email, perfil) values ('Bruno Lima', 'bruno@conectaevent.com', 'ORGANIZADOR');
insert into usuario (nome, email, perfil) values ('Carla Mendes', 'carla@email.com', 'PARTICIPANTE');
insert into usuario (nome, email, perfil) values ('Diego Ramos', 'diego@email.com', 'PARTICIPANTE');
insert into usuario (nome, email, perfil) values ('Elisa Prado', 'elisa@email.com', 'PARTICIPANTE');

insert into categoria (nome, descricao) values ('Música', 'Shows, festivais e apresentações musicais');
insert into categoria (nome, descricao) values ('Tecnologia', 'Palestras, hackathons e meetups de tecnologia');
insert into categoria (nome, descricao) values ('Esportes', 'Corridas, campeonatos e atividades esportivas');
insert into categoria (nome, descricao) values ('Teatro', 'Peças, stand-up e espetáculos');
insert into categoria (nome, descricao) values ('Workshops', 'Oficinas e cursos práticos');

-- Datas relativas a NOW() para os exemplos funcionarem em qualquer dia.
-- Evento 3 acontece em 1 dia: serve para demonstrar o prazo de reembolso de 48 horas.
-- Evento 4 tem capacidade 2 e já está esgotado.
insert into evento (titulo, descricao, data_hora, local_evento, valor, capacidade, imagem, categoria_id, organizador_id) values ('Festival de Rock Ourinhos', 'Bandas da região em uma noite de rock.', DATE_ADD(NOW(), INTERVAL 30 DAY), 'Parque de Exposições - Ourinhos/SP', 80.00, 500, null, 1, 1);
insert into evento (titulo, descricao, data_hora, local_evento, valor, capacidade, imagem, categoria_id, organizador_id) values ('Hackathon UniFIO', '24 horas de desenvolvimento em equipe.', DATE_ADD(NOW(), INTERVAL 20 DAY), 'UniFIO - Ourinhos/SP', 25.00, 100, null, 2, 1);
insert into evento (titulo, descricao, data_hora, local_evento, valor, capacidade, imagem, categoria_id, organizador_id) values ('Corrida Noturna 5K', 'Corrida de rua com percurso iluminado.', DATE_ADD(NOW(), INTERVAL 1 DAY), 'Avenida Jacinto Sá - Ourinhos/SP', 40.00, 200, null, 3, 2);
insert into evento (titulo, descricao, data_hora, local_evento, valor, capacidade, imagem, categoria_id, organizador_id) values ('Workshop de Angular', 'Oficina prática de Angular com Material.', DATE_ADD(NOW(), INTERVAL 10 DAY), 'Laboratório 3 - UniFIO', 50.00, 2, null, 5, 2);
insert into evento (titulo, descricao, data_hora, local_evento, valor, capacidade, imagem, categoria_id, organizador_id) values ('Noite de Stand-up', 'Comediantes da região em uma noite de humor.', DATE_ADD(NOW(), INTERVAL 15 DAY), 'Teatro Municipal - Ourinhos/SP', 35.00, 150, null, 4, 1);

insert into ingresso (codigo, titular, valor, status, data_compra, evento_id, participante_id) values ('CE-ROCK0001', 'Carla Mendes', 80.00, 'CONFIRMADO', NOW(), 1, 3);
insert into ingresso (codigo, titular, valor, status, data_compra, evento_id, participante_id) values ('CE-RUN00001', 'Carla Mendes', 40.00, 'CONFIRMADO', NOW(), 3, 3);
insert into ingresso (codigo, titular, valor, status, data_compra, evento_id, participante_id) values ('CE-WORK0001', 'Diego Ramos', 50.00, 'CONFIRMADO', NOW(), 4, 4);
insert into ingresso (codigo, titular, valor, status, data_compra, evento_id, participante_id) values ('CE-WORK0002', 'Elisa Prado', 50.00, 'CONFIRMADO', NOW(), 4, 5);
insert into ingresso (codigo, titular, valor, status, data_compra, evento_id, participante_id) values ('CE-HACK0001', 'Diego Ramos', 25.00, 'REEMBOLSO_SOLICITADO', NOW(), 2, 4);
insert into ingresso (codigo, titular, valor, status, data_compra, evento_id, participante_id) values ('CE-ROCK0002', 'Elisa Prado', 80.00, 'CONFIRMADO', NOW(), 1, 5);

insert into reembolso (motivo, status, valor, data_solicitacao, data_decisao, ingresso_id) values ('Não poderei comparecer por compromisso de trabalho.', 'PENDENTE', 25.00, NOW(), null, 5);
